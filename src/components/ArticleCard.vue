
<template>
    <div class="article-card">
      <a :href="titleLink" class="coverimg">
        <img :src="coverImage" alt="Article Image" @error="onImageError" />
        <div class="overlay">
          <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"
            fill="white">
            <path d="M15 24V11.8756L25.5 17.9378L36 24L25.5 30.0622L15 36.1244V24Z" fill="white" stroke="white"
              stroke-width="4" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="icons">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path
                d="M12 4.99805C9.48178 4.99805 7.283 5.12616 5.73089 5.25202C4.65221 5.33949 3.81611 6.16352 3.72 7.23254C3.60607 8.4998 3.5 10.171 3.5 11.998C3.5 13.8251 3.60607 15.4963 3.72 16.76355C3.81611 17.83255 4.65221 18.6566 5.73089 18.7441C7.283 18.8699 9.48178 18.998 12 18.998C14.5185 18.998 16.7174 18.8699 18.2696 18.74405C19.3481 18.65655 20.184 17.8328 20.2801 16.76405C20.394 15.4973 20.5 13.82645 20.5 11.998C20.5 10.16965 20.394 8.49877 20.2801 7.23205C20.184 6.1633 19.3481 5.33952 18.2696 5.25205C16.7174 5.12618 14.5185 4.99805 12 4.99805zM5.60965 3.75693C7.19232 3.62859 9.43258 3.49805 12 3.49805C14.5677 3.49805 16.8081 3.62861 18.3908 3.75696C20.1881 3.90272 21.6118 5.29278 21.7741 7.09773C21.8909 8.3969 22 10.11405 22 11.998C22 13.88205 21.8909 15.5992 21.7741 16.8984C21.6118 18.7033 20.1881 20.09335 18.3908 20.23915C16.8081 20.3675 14.5677 20.498 12 20.498C9.43258 20.498 7.19232 20.3675 5.60965 20.2392C3.81206 20.0934 2.38831 18.70295 2.22603 16.8979C2.10918 15.5982 2 13.8808 2 11.998C2 10.1153 2.10918 8.39787 2.22603 7.09823C2.38831 5.29312 3.81206 3.90269 5.60965 3.75693z"
                fill="currentColor"></path>
              <path
                d="M14.7138 10.96875C15.50765 11.4271 15.50765 12.573 14.71375 13.0313L11.5362 14.8659C10.74235 15.3242 9.75 14.7513 9.75001 13.8346L9.75001 10.1655C9.75001 9.24881 10.74235 8.67587 11.5362 9.13422L14.7138 10.96875z"
                fill="currentColor"></path>
            </svg>
            {{ views }}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path
                d="M12 4.99805C9.48178 4.99805 7.283 5.12616 5.73089 5.25202C4.65221 5.33949 3.81611 6.16352 3.72 7.23254C3.60607 8.4998 3.5 10.171 3.5 11.998C3.5 13.8251 3.60607 15.4963 3.72 16.76355C3.81611 17.83255 4.65221 18.6566 5.73089 18.7441C7.283 18.8699 9.48178 18.998 12 18.998C14.5185 18.998 16.7174 18.8699 18.2696 18.74405C19.3481 18.65655 20.184 17.8328 20.2801 16.76405C20.394 15.4973 20.5 13.82645 20.5 11.998C20.5 10.16965 20.394 8.49877 20.2801 7.23205C20.184 6.1633 19.3481 5.33952 18.2696 5.25205C16.7174 5.12618 14.5185 4.99805 12 4.99805zM5.60965 3.75693C7.19232 3.62859 9.43258 3.49805 12 3.49805C14.5677 3.49805 16.8081 3.62861 18.3908 3.75696C20.1881 3.90272 21.6118 5.29278 21.7741 7.09773C21.8909 8.3969 22 10.11405 22 11.998C22 13.88205 21.8909 15.5992 21.7741 16.8984C21.6118 18.7033 20.1881 20.09335 18.3908 20.23915C16.8081 20.3675 14.5677 20.498 12 20.498C9.43258 20.498 7.19232 20.3675 5.60965 20.2392C3.81206 20.0934 2.38831 18.70295 2.22603 16.8979C2.10918 15.5982 2 13.8808 2 11.998C2 10.1153 2.10918 8.39787 2.22603 7.09823C2.38831 5.29312 3.81206 3.90269 5.60965 3.75693z"
                fill="currentColor"></path>
              <path
                d="M15.875 10.75L9.875 10.75C9.46079 10.75 9.125 10.4142 9.125 10C9.125 9.58579 9.46079 9.25 9.875 9.25L15.875 9.25C16.2892 9.25 16.625 9.58579 16.625 10C16.625 10.4142 16.2892 10.75 15.875 10.75z"
                fill="currentColor"></path>
              <path
                d="M17.375 14.75L11.375 14.75C10.9608 14.75 10.625 14.4142 10.625 14C10.625 13.5858 10.9608 13.25 11.375 13.25L17.375 13.25C17.7892 13.25 18.125 13.5858 18.125 14C18.125 14.4142 17.7892 14.75 17.375 14.75z"
                fill="currentColor"></path>
              <path
                d="M7.875 10C7.875 10.4142 7.53921 10.75 7.125 10.75L6.625 10.75C6.21079 10.75 5.875 10.4142 5.875 10C5.875 9.58579 6.21079 9.25 6.625 9.25L7.125 9.25C7.53921 9.25 7.875 9.58579 7.875 10z"
                fill="currentColor"></path>
              <path
                d="M9.375 14C9.375 14.4142 9.03921 14.75 8.625 14.75L8.125 14.75C7.71079 14.75 7.375 14.4142 7.375 14C7.375 13.5858 7.71079 13.25 8.125 13.25L8.625 13.25C9.03921 13.25 9.375 13.5858 9.375 14z"
                fill="currentColor"></path>
            </svg>
            {{ favorites }}
          </span>
          <span class="video-duration">{{ duration }}</span>
        </div>
      </a>
  
      <div class="details">
        <div class="article-title">
          <a :href="titleLink">{{ title }}</a> <!-- 标题链接 -->
        </div>
        <div class="article-info">
          <div class="article-author">
            <a :href="authorLink">{{ author }}</a> <!-- 作者链接 -->
          </div>
          <div class="article-time">{{ time }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ArticleCard',
    props: {
      coverImage: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      author: {
        type: String,
        required: true
      },
      time: {
        type: String,
        required: true
      },
      views: {
        type: Number,
        required: true
      },
      favorites: {
        type: Number,
        required: true
      },
      duration: {
        type: String,
        required: true
      },
      titleLink: { // 新增标题链接属性
        type: String,
        required: true
      },
      authorLink: { // 新增作者链接属性
        type: String,
        required: true
      }
    },
    setup() {
      const onImageError = (event) => {
        event.target.src = require('@/assets/image/image_fail_load.png');
      }
      return {
        onImageError
      }
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  
  .article-card {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    overflow: hidden;
    margin: 0 0;
    width: 16.5625rem;
    /* 调整卡片的宽度为 265px */
    height: 14.0625rem;
    /* 调整卡片的高度为 225px */
    background-color: #ffffff;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    border: 0.0625rem solid #ccc;
    /* 使用 rem 作为单位 */
  }
  
  .article-card:hover {
    transform: translateY(-0.3125rem);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  }
  
  .coverimg {
    position: relative;
    display: block;
    text-decoration: none;
  }
  
  .coverimg img {
    width: 100%;
    height: auto;
    border-radius: 0.5rem 0.5rem 0 0;
    aspect-ratio: 16 / 9;
  }
  
  .coverimg .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 4px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .coverimg:hover .overlay {
    opacity: 1;
  }
  
  .coverimg .play-icon {
    fill: #fff;
    width: 48px;
    height: 48px;
  }
  
  .icons {
    position: absolute;
    bottom: 0.25rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 0.5rem);
    padding: 0.25rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
    transition: opacity 0.2s;
  }
  
  .coverimg:hover .icons {
    opacity: 0;
  }
  
  .icons span {
    display: flex;
    align-items: center;
    margin-right: 0.1875rem;
    color: #fff;
  }
  
  .icons svg {
    margin: 0 0.1875rem;
  }
  
  .video-duration {
    margin-left: auto;
    padding-right: 0;
    color: #fff;
  }
  
  .details {
    padding: 10px;
    text-decoration: none;
    color: inherit;
    display: block;
    background-color: #fff;
    border-radius: 0 0 0.5rem 0.5rem;
    margin-top: -0.5rem;
    /* 上移 5px */
  }
  
  .article-title {
    font-size: 1rem;
    /* 调整标题字体大小 */
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-family: 'Roboto', sans-serif;
    transition: color 0.2s;
    user-select: none;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 2.5rem;
    /* 调整标题高度 */
  }
  
  .article-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    /* 调整信息字体大小 */
    color: #717171;
    user-select: none;
  }
  
  .article-author,
  .article-time {
    margin-bottom: 0.25rem;
  }
  
  .article-title a:visited,
  .article-author a:visited {
    color: inherit;
  }
  
  .article-title a,
  .article-author a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
    cursor: pointer;
  }
  
  .article-title a:hover,
  .article-author a:hover {
    color: rgb(29, 104, 195);
  }
  </style>