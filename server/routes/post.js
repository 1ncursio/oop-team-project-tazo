const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { isLoggedIn } = require('./middlewares');
const { Post, PostComment, User, PostImage } = require('../models');
const { STATUS_404_POST } = require('../utils/message');

const { uploadGCS, storage, bucket } = require('../utils/upload');

//  GET /post
router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(404).json({ success: false, message: STATUS_404_POST });
    }

    await post.increment('views');

    const fullPost = await Post.findOne({
      where: { id: req.params.postId },
      order: [
        [PostComment, 'replyId', 'ASC'],
        [PostComment, 'id', 'ASC'],
      ],
      include: [
        {
          model: PostImage,
          attributes: ['id', 'src'],
        },
        {
          model: User, // 포스트 작성자
          attributes: ['id', 'nickname', 'image'],
        },
        {
          model: PostComment,
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
    const { title, content, src } = req.body;

    const post = await Post.create({
      title: title ? title : '파티 구해요~',
      content,
      UserId: req.user.id,
    });

    if (src) {
      const image = await PostImage.create({ src });
      await post.addPostImages(image);
    }

    const fullPost = await Post.findOne({
      where: {
        id: post.id,
      },
      include: [
        {
          model: PostComment,
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

// PATCH /post
router.patch('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { postId } = req.params;

    const post = await Post.findOne({ where: { id: postId, UserId: req.user.id } });
    if (!post) {
      return res.status(404).json({ success: false, message: STATUS_404_POST });
    }

    await Post.update(
      {
        title,
        content,
      },
      { where: { id: postId, UserId: req.user.id } }
    );

    const fullPost = await Post.findOne({
      where: {
        id: postId,
      },
      include: [
        {
          model: PostComment,
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
    res.status(200).json(fullPost);
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

/* Image Upload route */

// POST /post/image
router.post('/image', isLoggedIn, uploadGCS.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '이미지가 업로드되지 않았습니다.' });
    }

    const blob = bucket.file(`uploads/${Date.now()}_${req.file.originalname.replace(' ', '_')}`);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      res.status(200).json({ success: true, image: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

/* Comment routes */

// POST /post/1/comment
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await PostComment.create({
      content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
    });

    await comment.update({
      replyId: comment.id,
    });

    const fullComment = await PostComment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });
    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* REPLY ROUTES */
// POST /post/1/reply
router.post('/:postId/reply', isLoggedIn, async (req, res, next) => {
  try {
    const { content, replyId } = req.body;
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const reply = await PostComment.create({
      content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
      replyId,
    });

    const fullReply = await PostComment.findOne({
      where: { id: reply.id },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });
    res.status(201).json(fullReply);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* 이미지 업로드 테스트 라우터 */
router.post('/test/image', uploadGCS.array('image'), async (req, res, next) => {
  try {
    for (let i = 0; i < req.files.length; i++) {
      console.log('req.files[i].originalname', req.files[i].originalname);

      const blob = bucket.file(`uploads/${Date.now()}_${req.files[i].originalname.replace(' ', '_')}`);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (err) => {
        next(err);
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('publicUrl', publicUrl);

        res.status(201).json({ success: true, publicUrl });
      });

      blobStream.end(req.files[i].buffer);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
