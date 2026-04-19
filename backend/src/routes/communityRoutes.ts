import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { db } from '../config/firebase';

const router = Router();

// Real-time Community Forum (CRUD for posts/comments)
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const postsSnapshot = await db.collection('posts').orderBy('timestamp', 'desc').get();
    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).send('Missing title or content for the post.');
  }

  try {
    const newPost = {
      userId: req.user.uid, // Assuming req.user is populated by authMiddleware
      author: req.user.displayName || req.user.email, // Assuming user info is available
      title,
      content,
      timestamp: new Date(),
      commentsCount: 0,
      votes: 0,
    };
    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const postDoc = await db.collection('posts').doc(req.params.id).get();
    if (!postDoc.exists) {
      return res.status(404).send('Post not found.');
    }
    const commentsSnapshot = await db.collection('posts').doc(req.params.id).collection('comments').orderBy('timestamp').get();
    const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ id: postDoc.id, ...postDoc.data(), comments });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ error: 'Failed to retrieve post.' });
  }
});

router.put('/posts/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).send('Post not found.');
    }

    // Optional: Add authorization check here (e.g., only author can update)
    // if (postDoc.data()?.userId !== req.user.uid) {
    //   return res.status(403).send('Unauthorized to update this post.');
    // }

    await postRef.update({ title, content, lastUpdated: new Date() });
    res.status(200).send('Post updated successfully.');
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post.' });
  }
});

router.delete('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).send('Post not found.');
    }

    // Optional: Add authorization check here (e.g., only author can delete)
    // if (postDoc.data()?.userId !== req.user.uid) {
    //   return res.status(403).send('Unauthorized to delete this post.');
    // }

    await postRef.delete();
    res.status(200).send('Post deleted successfully.');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).send('Missing comment content.');
  }

  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).send('Post not found.');
    }

    const newComment = {
      userId: req.user.uid,
      author: req.user.displayName || req.user.email,
      content,
      timestamp: new Date(),
    };
    await postRef.collection('comments').add(newComment);

    // Increment comments count on the post
    await postRef.update({ commentsCount: (postDoc.data()?.commentsCount || 0) + 1 });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// Peer-to-Peer Matching system (Placeholder)
router.post('/match', authMiddleware, (req, res) => {
  // Logic for Peer-to-Peer Matching - This would involve more complex matching algorithms
  // and potentially real-time communication setup.
  res.status(200).send('Peer-to-Peer Matching logic to be implemented.');
});

// Q&A Discussions & Voting (Placeholder)
router.post('/posts/:id/vote', authMiddleware, async (req, res) => {
  const { type } = req.body; // 'upvote' or 'downvote'
  if (!type || (type !== 'upvote' && type !== 'downvote')) {
    return res.status(400).send('Invalid vote type. Must be 'upvote' or 'downvote'.');
  }

  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).send('Post not found.');
    }

    let newVotes = (postDoc.data()?.votes || 0);
    if (type === 'upvote') {
      newVotes++;
    } else if (type === 'downvote') {
      newVotes--;
    }

    await postRef.update({ votes: newVotes });
    res.status(200).json({ message: 'Vote recorded.', newVotes });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote.' });
  }
});

export default router;