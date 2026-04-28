# Security Specification for Web3Quest

## Data Invariants
1. Users can only edit their own profiles.
2. Game sessions can only be updated by the creator (lobby status) or players within the session.
3. Players can only be added to a session that is in 'lobby' status.
4. XP and Level remain non-negative.
5. Achievements are immutable once created.

## The Dirty Dozen (Test Matrix)
1. Unauthorized user trying to read user X's private stats.
2. User X trying to update User Y's XP.
3. User trying to join a game session that is 'playing'.
4. User trying to delete a game session they didn't create.
5. User trying to update their own role (if it existed) or points via a "ghost field".
6. User trying to create a game session with an invalid room code.
7. User trying to update their score in a session they are not part of.
8. User trying to update their score by a massive increment (+1,000,000).
9. User trying to update `createdAt` field after creation.
10. Unauthenticated user trying to write anything.
11. User trying to read all sessions without filtering (blanket read check).
12. User trying to update their profile with a 2MB string.
