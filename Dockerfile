FROM node:8-onbuild
MAINTAINER Stepan Kuzmin <to.stepan.kuzmin@gmail.com>

ENV NPM_CONFIG_COLOR=false
ENV NPM_CONFIG_LOGLEVEL=warn

EXPOSE 4000
ENTRYPOINT ["npm", "start", "--"]
