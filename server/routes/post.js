const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('./middlewares');
const { Post, Comment, User } = require('../models');

//  GET /post
router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(404).json({ success: false, message: '존재하지 않는 게시글입니다.' });
    }

    await post.increment('views');

    const fullPost = await Post.findOne({
      where: { id: req.params.postId },
      order: [
        [Comment, 'replyId', 'ASC'],
        [Comment, 'id', 'ASC'],
      ],
      include: [
        {
          model: User, // 포스트 작성자
          attributes: ['id', 'nickname', 'image'],
        },
        {
          model: Comment,
          include: [
            {
              model: User, // 댓글 작성자
              attributes: ['id', 'nickname', 'image'],
            },
          ],
        },
        // {
        //   model: User, // 좋아요 누른 사람
        //   as: 'Likers',
        //   attributes: ['id'],
        // },
      ],
    });
    res.status(200).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST /post
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const post = await Post.create({
      title,
      content,
      UserId: req.user.id,
    });

    const fullPost = await Post.findOne({
      where: {
        id: post.id,
      },
      include: [
        {
          model: Comment,
          include: [
            {
              model: User, // 댓글 작성자
              attributes: ['id', 'nickname', 'image'],
            },
          ],
        },
        {
          model: User, // 게시글 작성자
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// DELETE /post/10
router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: { id: req.params.postId, UserId: req.user.id },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
