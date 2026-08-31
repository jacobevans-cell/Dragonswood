param(
  [string]$FfmpegPath = "",
  [string]$FfprobePath = ""
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$reviewRoot = Join-Path $repo "assets\audio\rune-spelling\spalding-track-review"
$outputRoot = Join-Path $repo "assets\audio\rune-spelling\approved-spalding-mp3"

function Resolve-AudioTool([string]$requested, [string]$name) {
  if ($requested) {
    if (-not (Test-Path -LiteralPath $requested -PathType Leaf)) { throw "$name was not found: $requested" }
    return (Resolve-Path -LiteralPath $requested).Path
  }
  $command = Get-Command $name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $bundled = Get-ChildItem -LiteralPath (Join-Path $repo "tools-cache\ffmpeg") -Filter "$name.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($bundled) { return $bundled.FullName }
  throw "$name is required. Pass -$($name.Substring(0,1).ToUpper()+$name.Substring(1))Path or install FFmpeg."
}

function Get-ReadableSlug([string]$label) {
  $value = $label.ToLowerInvariant()
  # Labels such as "ā /eɪ/ as in ate" carry both a classroom symbol and IPA.
  # Keep the classroom symbol/example in the filename and leave the IPA in the manifest.
  if ($value -match '^([^/]+?)\s+/([^/]+)/\s*(.*)$') {
    $prefix = $Matches[1].Trim()
    $sound = $Matches[2].Trim()
    $suffix = $Matches[3].Trim()
    if ($prefix -match '^(ă|ā|ah|ŏ|ō|oo|ĕ|ē|ĭ|ī|ŭ|ū)$') {
      $value = "$prefix $suffix".Trim()
    } else {
      $value = "$prefix $sound $suffix".Trim()
    }
  }
  $replacements = [ordered]@{
    "ā"="long-a"; "ă"="short-a"; "ē"="long-e"; "ĕ"="short-e"
    "ī"="long-i"; "ĭ"="short-i"; "ō"="long-o"; "ŏ"="short-o"
    "ū"="long-u"; "ŭ"="short-u"; "ēr"="long-e-r"
    "ʃ"="sh"; "ʒ"="zh"; "θ"="unvoiced-th"; "ð"="voiced-th"
    "æ"="short-a"; "ɑ"="ah"; "ɛ"="short-e"; "ɪ"="short-i"
    "ʌ"="short-u"; "ŋ"="ng"
  }
  foreach ($key in $replacements.Keys) { $value = $value.Replace($key,$replacements[$key]) }
  $value = $value.Replace('/',' ')
  $value = $value -replace '[^a-z0-9]+','-'
  $value = $value.Trim('-')
  if (-not $value) { $value = "sound" }
  if ($value.Length -gt 72) { $value = $value.Substring(0,72).TrimEnd('-') }
  return $value
}

$ffmpeg = Resolve-AudioTool $FfmpegPath "ffmpeg"
$ffprobe = Resolve-AudioTool $FfprobePath "ffprobe"

if (Test-Path -LiteralPath $outputRoot) {
  $resolved = (Resolve-Path -LiteralPath $outputRoot).Path
  $expectedParent = (Resolve-Path -LiteralPath (Split-Path $outputRoot -Parent)).Path
  if ((Split-Path $resolved -Leaf) -ne "approved-spalding-mp3" -or -not $resolved.StartsWith($expectedParent + [IO.Path]::DirectorySeparatorChar)) {
    throw "Refusing to replace unexpected directory: $resolved"
  }
  Remove-Item -LiteralPath $resolved -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$records = [Collections.Generic.List[object]]::new()
for ($track = 1; $track -le 4; $track++) {
  $mapPath = Join-Path $reviewRoot "track-$track-approved-map.json"
  $map = Get-Content -Raw -LiteralPath $mapPath | ConvertFrom-Json
  $source = Join-Path $reviewRoot $map.sourceTrack
  $actualSourceHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToUpperInvariant()
  if ($actualSourceHash -ne $map.sourceSha256.ToUpperInvariant()) {
    throw "Source hash mismatch for $($map.sourceTrack)."
  }
  foreach ($entry in $map.mapping) {
    for ($index = 0; $index -lt $entry.shortSoundIntervals.Count; $index++) {
      $interval = $entry.shortSoundIntervals[$index]
      $start = [double]$interval[0]
      $end = [double]$interval[1]
      $duration = $end - $start
      if ($duration -le 0) { throw "Invalid interval for phonogram $($entry.number), clip $($index + 1)." }
      $label = [string]$entry.expectedSounds[$index]
      $phonogramSlug = ([string]$entry.expectedPhonogram).ToLowerInvariant() -replace '[^a-z0-9]+','-'
      $filename = "spalding-{0:D3}-{1}-{2:D2}-{3}.mp3" -f [int]$entry.number,$phonogramSlug,($index + 1),(Get-ReadableSlug $label)
      $destination = Join-Path $outputRoot $filename
      $title = "$($entry.number). $($entry.expectedPhonogram) — $label"
      $arguments = @(
        "-y","-hide_banner","-loglevel","error",
        "-ss",$start.ToString("0.000000",[Globalization.CultureInfo]::InvariantCulture),
        "-i",$source,
        "-t",$duration.ToString("0.000000",[Globalization.CultureInfo]::InvariantCulture),
        "-vn","-map_metadata","-1","-ac","1","-ar","44100","-c:a","libmp3lame","-b:a","192k",
        "-id3v2_version","3",
        "-metadata","title=$title",
        "-metadata","artist=Spalding source recording (authorized Dragonswood classroom use)",
        "-metadata","album=Dragonswood Approved Spalding Phonograms Tracks 1-4",
        "-metadata","track=$($entry.number)",
        "-metadata","comment=Exact approved excerpt from $($map.sourceTrack); source interval $start-$end seconds",
        $destination
      )
      & $ffmpeg @arguments
      if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $destination)) { throw "FFmpeg failed for $filename." }
      $probeText = & $ffprobe -v error -show_entries "format=duration:stream=codec_name,sample_rate,channels" -of json $destination
      if ($LASTEXITCODE -ne 0) { throw "FFprobe failed for $filename." }
      $probe = $probeText | ConvertFrom-Json
      $actualDuration = [double]$probe.format.duration
      if ($probe.streams[0].codec_name -ne "mp3") { throw "$filename is not MP3." }
      if ($actualDuration -lt 0.10 -or $actualDuration -gt ($duration + 0.15)) { throw "Unexpected duration for ${filename}: $actualDuration" }
      $records.Add([ordered]@{
        clipId = ("spalding-{0:D3}-{1:D2}" -f [int]$entry.number,($index + 1))
        number = [int]$entry.number
        track = $track
        phonogram = [string]$entry.expectedPhonogram
        soundIndex = $index + 1
        label = $label
        filename = $filename
        relativePath = "assets/audio/rune-spelling/approved-spalding-mp3/$filename"
        source = [ordered]@{
          type = "approved-Spalding-track-excerpt"
          track = $map.sourceTrack
          trackSha256 = $actualSourceHash.ToLowerInvariant()
          startSeconds = $start
          endSeconds = $end
          approvedBy = "Jacob"
          approval = $map.approval
        }
        transformation = "Exact source interval re-encoded to mono 44.1 kHz 192 kbps MP3; no replacement or synthesized audio"
        durationSeconds = [math]::Round($actualDuration,6)
        codec = $probe.streams[0].codec_name
        sampleRate = [int]$probe.streams[0].sample_rate
        channels = [int]$probe.streams[0].channels
        bytes = (Get-Item -LiteralPath $destination).Length
        sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
      })
    }
  }
}

if ($records.Count -ne 108) { throw "Expected 108 standalone MP3 files; generated $($records.Count)." }
$fileCount = (Get-ChildItem -LiteralPath $outputRoot -Filter "*.mp3" -File).Count
if ($fileCount -ne 108) { throw "Expected 108 MP3 files on disk; found $fileCount." }

$manifest = [ordered]@{
  schemaVersion = 1
  title = "Dragonswood owner-approved Spalding phonogram MP3 library"
  createdAt = (Get-Date).ToUniversalTime().ToString("o")
  sourcePolicy = "Every audio byte originates from the owner-approved Spalding Track01-Track04 recordings; no MIT, TTS, or outside sound bank is used."
  authorization = "Included under Jacob's user-attested special permission for Dragonswood's private, noncommercial classroom use; not a general redistribution grant."
  phonogramCount = 70
  clipCount = $records.Count
  clips = $records
}
$manifest | ConvertTo-Json -Depth 14 | Set-Content -LiteralPath (Join-Path $outputRoot "approved-spalding-mp3-manifest.json") -Encoding utf8
$records | ForEach-Object {
  [pscustomobject]@{
    clip_id=$_.clipId;number=$_.number;track=$_.track;phonogram=$_.phonogram;sound_index=$_.soundIndex;label=$_.label
    filename=$_.filename;duration_seconds=$_.durationSeconds;bytes=$_.bytes;sha256=$_.sha256
    source_track=$_.source.track;source_track_sha256=$_.source.trackSha256;source_start_seconds=$_.source.startSeconds;source_end_seconds=$_.source.endSeconds
    transformation=$_.transformation
  }
} | Export-Csv -LiteralPath (Join-Path $outputRoot "approved-spalding-mp3-manifest.csv") -NoTypeInformation -Encoding utf8

[pscustomobject]@{
  outputRoot = $outputRoot
  phonograms = 70
  mp3Files = $fileCount
  manifestEntries = $records.Count
  totalBytes = (Get-ChildItem -LiteralPath $outputRoot -Filter "*.mp3" -File | Measure-Object Length -Sum).Sum
  ffmpeg = $ffmpeg
} | ConvertTo-Json -Depth 5
