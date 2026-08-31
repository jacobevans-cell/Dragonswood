$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$generator = Join-Path $PSScriptRoot 'generate-azure-brian.mjs'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  throw 'Node.js was not found. Install Node.js 20 or newer, then run this file again.'
}

$region = Read-Host 'Azure Speech region (press Enter for eastus)'
if ([string]::IsNullOrWhiteSpace($region)) { $region = 'eastus' }
if ($region -notmatch '^[a-z0-9-]+$') { throw 'The Azure region contains invalid characters.' }

$secureKey = Read-Host 'Azure Speech key (hidden; it will not be saved)' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
$plainKey = $null

try {
  $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  if ([string]::IsNullOrWhiteSpace($plainKey)) { throw 'An Azure Speech key is required.' }
  $env:AZURE_SPEECH_KEY = $plainKey
  $env:AZURE_SPEECH_REGION = $region.ToLowerInvariant()
  Push-Location $projectRoot
  try {
    & $nodeCommand.Source $generator --generate
    if ($LASTEXITCODE -ne 0) { throw "The generator exited with code $LASTEXITCODE." }
  }
  finally { Pop-Location }
}
finally {
  Remove-Item Env:AZURE_SPEECH_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:AZURE_SPEECH_REGION -ErrorAction SilentlyContinue
  $plainKey = $null
  if ($keyPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer) }
}
