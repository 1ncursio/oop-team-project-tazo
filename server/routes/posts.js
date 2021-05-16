const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

const { Post, PostComment, User, PostImage } = require('../models');

//  GET api/posts
router.get('/', async (req, res, next) => {
  try {
    const where = { board: 'illustration' };
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 아닐 때
      // where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }; //보다 작은
    }
    const posts = await Post.findAll({
      limit: parseInt(req.query.perPage, 10),
      order: [
        ['createdAt', 'DESC'],
        [PostComment, 'createdAt', 'DESC'],
      ],
      offset: req.query.perPage * (req.query.page - 1),
      include: [
        {
          model: User, // 포스트 작성자
          attributes: ['id', 'nickname', 'image'],
        },
        {
          model: PostImage,
          attributes: ['src'],
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
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
