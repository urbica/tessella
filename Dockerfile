FROM node:7-onbuild
MAINTAINER Stepan Kuzmin <to.stepan.kuzmin@gmail.com>

EXPOSE 4000
ENTRYPOINT ["npm", "start", "--"]
CMD ["data.mbtiles"]
