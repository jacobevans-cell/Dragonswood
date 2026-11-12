# Dragonswood gift exchange

The Gift Exchange link appears in the student and teacher portals. It uses the same Firebase project and browser session as Dragonswood. The teacher creates the exchange from the new page, choosing a title, maximum gift budget, join deadline, wishlist deadline, and gift day. No event dates or budget are hard-coded.

Students opt in individually. They may withdraw before the draw and may edit a short wishlist until its deadline. The teacher closes signups and draws, then can redraw the same roster. With fewer than two students the draw is refused. A draw is a random single cycle, so everyone gives to exactly one other participant, everyone receives exactly once, and self-draws are impossible. A redraw increments the draw version; students see only their current recipient.

Firestore stores the event at `giftExchanges/current`, with `participants`, `wishlists`, and `assignments` subcollections. Student reads are limited to their own participation, wishlist, and assignment. A student's assigned recipient's wishlist is the only peer wishlist they may read. The teacher can list the roster, wishlists, and assignments. The browser never sends peer email addresses or full student profiles to a student. Assignment documents are written atomically with the draw version. The teacher's roster and draw view requires the authorized teacher Google account.

The event is intentionally limited to one current exchange. After the draw, the roster and settings stay locked, while the teacher can redraw. Because a previous recipient may already have been seen, a redraw cannot retract that knowledge.

## Release

Merge the site changes through the repository's normal GitHub Pages flow, and deploy `firestore.rules` before inviting students. The repository's **Deploy Dragonswood Firebase Backend** workflow supports the `firestore-rules` target with its live deployment confirmation. The page will not work until the new rules are deployed. Set the event details in the teacher portal after deployment; leave it unconfigured until the class is ready.

Run `node gift-exchange-core.test.mjs` to verify the draw invariant. Test signed-in teacher and student access against the Firebase emulator before the live rules deployment.

