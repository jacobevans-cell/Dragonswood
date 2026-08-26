# Add a Game

1. Create `site/games/<game-id>/`.
2. Add the game to `site/js/game-registry.js`.
3. Give the card an image in `site/assets/`.
4. When the game has a valid leaderboard result, send:

```js
window.parent.postMessage({
  channel: 'dragonswood-arcade',
  type: 'score',
  gameId: 'my-game',
  boardId: 'my-game',
  score: 12345,
  metric: '12,345 points',
  details: {}
}, location.origin);
```

5. Add the board ID to `BOARDS` in `game-registry.js`, Firestore validation, and the scheduled function's `BOARDS` list.
6. **Do not write Gold, XP, classPoints, pets, fragments, or reward claims from the game.**
