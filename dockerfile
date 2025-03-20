FROM node:18 AS builder

WORKDIR /app 

COPY ./package* /app/  

RUN npm install

COPY . /app

RUN npm run build

FROM nginx:stable-alpine

# Nginx 기본 설정 삭제 및 새로운 설정 복사
RUN rm -rf /etc/nginx/conf.d

COPY conf /etc/nginx

# 빌드된 파일을 Nginx의 루트 폴더로 이동
COPY --from=builder /app/build /usr/share/nginx/html

# 3000포트 오픈하고 nginx 실행
EXPOSE 3000