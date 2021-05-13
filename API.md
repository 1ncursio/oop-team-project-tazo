# REST API

HTTP 요청 리스트(ajax)

## Auth

---

### GET /auth

- 현재 로그인한 유저의 정보를 가져옴
- return IUser

#### 데이터 예시

---

```
{
  "id": 1,
  "email": "cjsgh0626@naver.com",
  "nickname": "김예찬",
  "image": "1620901289224_353683_236958_5647.jpg",
  "introduction": null,
  "provider": "kakao",
  "snsId": "1719336309",
  "status": 0,
  "gender": "male",
  "role": 0,
  "createdAt": "2021-05-13T09:45:52.000Z",
  "updatedAt": "2021-05-13T10:21:29.000Z"
}
```

## Rooms

---

### GET /rooms/:roomId/chat

- roomId 방의 채팅 리스트를 가져옴
- return IChat[]

#### 데이터 예시

---

```
[
  {
    "id": 1,
    "content": "ㅎㅇ",
    "createdAt": "2021-05-13T09:46:07.000Z",
    "updatedAt": "2021-05-13T09:46:07.000Z",
    "UserId": 1,
    "RoomId": 1,
    "User": {
      "id": 1,
      "nickname": "김예찬",
      "image": "1620901289224_353683_236958_5647.jpg"
    }
  },
  {
    "id": 2,
    "content": "테스트",
    "createdAt": "2021-05-13T09:46:12.000Z",
    "updatedAt": "2021-05-13T09:46:12.000Z",
    "UserId": 1,
    "RoomId": 1,
    "User": {
      "id": 1,
      "nickname": "김예찬",
      "image": "1620901289224_353683_236958_5647.jpg"
    }
  },
  ...more data
]
```

# WebSocket

### POST /rooms/:roomId/chat

- roomId 방에 채팅을 생성
- return IChat

#### 데이터 예시

---

```
{
  "id": 1,
  "content": "ㅎㅇ",
  "createdAt": "2021-05-13T09:46:07.000Z",
  "updatedAt": "2021-05-13T09:46:07.000Z",
  "UserId": 1,
  "RoomId": 1,
  "User": {
    "id": 1,
    "nickname": "김예찬",
    "image": "1620901289224_353683_236958_5647.jpg"
  }
}
```
