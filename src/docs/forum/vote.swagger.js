/**
 * @swagger
 * tags:
 *   name: Forum - Votes
 *   description: Voting on posts and answers
 *
 * /api/votes:
 *   post:
 *     summary: Cast, switch, or remove a vote
 *     description: |
 *       Vote behaviour:
 *       - **Same vote type again** → removes the vote (toggle off), upvoteCount adjusted
 *       - **Different vote type** → switches the vote, upvoteCount adjusted by ±2
 *       - **New vote** → cast the vote, upvoteCount adjusted by ±1
 *
 *       User must be a forum member and not banned to vote.
 *     tags: [Forum - Votes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CastVoteRequest'
 *     responses:
 *       200:
 *         description: Vote cast, updated, or removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CastVoteResponse'
 *             examples:
 *               VoteCast:
 *                 summary: New vote cast
 *                 value:
 *                   code: 200
 *                   message: Vote cast
 *                   content:
 *                     _id: 64f1c2e4a12b3456789abcde
 *                     userId: 64f1c2e4a12b3456789abcdf
 *                     targetId: 64f1c2e4a12b3456789abce0
 *                     targetType: Post
 *                     voteType: upvote
 *                     createdAt: 2026-02-22T10:00:00.000Z
 *               VoteUpdated:
 *                 summary: Vote switched
 *                 value:
 *                   code: 200
 *                   message: Vote updated
 *                   content:
 *                     _id: 64f1c2e4a12b3456789abcde
 *                     userId: 64f1c2e4a12b3456789abcdf
 *                     targetId: 64f1c2e4a12b3456789abce0
 *                     targetType: Post
 *                     voteType: downvote
 *                     createdAt: 2026-02-22T10:00:00.000Z
 *               VoteRemoved:
 *                 summary: Vote removed (toggled off)
 *                 value:
 *                   code: 200
 *                   message: Vote removed
 *                   content: null
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: You are banned from this forum or must join first
 *       404:
 *         description: Post or Answer not found
 */