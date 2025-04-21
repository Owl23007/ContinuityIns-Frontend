export const ArticleStatus = {
  DRAFT: "DRAFT",
  PRIVATE: "PRIVATE",
  PUBLISHED: "PUBLISHED",
  BANNED: "BANNED",
};

export class ArticleDTO {
  articleId;
  title;
  content;
  coverImg;
  status;
  createUser;
  createTime;

  constructor(
    articleId,
    title,
    content,
    coverImg,
    status,
    createUser,
    createTime,
  ) {
    this.articleId = articleId;
    this.title = title;
    this.content = content;
    this.coverImg = coverImg;
    this.status = status;
    this.createUser = createUser;
    this.createTime = createTime;
  }
}

export class ArticlePreviewDTO {
  articleId;
  title;
  coverImg;
  status;
  createUser;
  createTime;

  constructor(articleId, title, coverImg, status, createUser, createTime) {
    this.articleId = articleId;
    this.title = title;
    this.coverImg = coverImg;
    this.status = status;
    this.createUser = createUser;
    this.createTime = createTime;
  }
}
