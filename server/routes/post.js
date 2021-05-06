const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { isLoggedIn } = require('./middlewares');
const { Post, PostComment, User, PostImage } = require('../models');

try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      // 제로초.png
      // const ext = path.extname(file.originalname); // 확장자 추출(.png)
      // const basename = path.basename(file.originalname, ext); // 제로초
      done(null, `${Date.now()}_${path.basename(file.originalname)}`); // 제로초_15184712891.png
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

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
      return res.status(404).json({ success: false, message: '포스트를 찾을 수 없습니다.' });
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
router.post('/image', isLoggedIn, upload.single('image'), async (req, res, next) => {
  console.log(req.file);
  // console.log(req.files);
  res.json(req.file.filename);
});

/* Comment routes */

// POST /post/1/comment
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await PostComment.create({
      content: req.body.content,
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

module.exports = router;
