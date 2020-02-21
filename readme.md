<h1 align="center">
  Wiki
</h1>

<h4 align="center">
  Modern, lightweight and powerful wiki app built with Angular and Node.js
</h4>

<div align="center">
  <img alt="List" width="70%" src="media/wiki.png">
</div>

## Description

## Highlights

- Markdown editor
- User and role management
- Advanced search
- Darkmode
- Tag functionality
- Favorites functionality
- Code highlighting 
- File and Image upload

## Contents

- [Description](#description)
- [Highlights](#highlights)
- [Contents](#contents)
- [Install](#install)
  - [Docker-Compose](#docker-compose)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Server](#server)
  - [In Detail](#in-detail)
    - [frontend](#frontend)
    - [backend](#backend)
    - [port](#port)
    - [db](#db)
    - [search](#search)
    - [paths](#paths)
      - [repo](#repo)
      - [data](#data)
    - [uploads](#uploads)
      - [maxImageFileSize](#maximagefilesize)
      - [maxOtherFileSize](#maxotherfilesize)
    - [auth](#auth)
      - [defaultAdminEmail](#defaultadminemail)
    - [sessionSecret](#sessionsecret)
    - [git](#git)
      - [url](#url)
  - [App](#app)
- [Images](#images)

## Install

### Docker-Compose
1. Download [docker-compose.yaml](https://github.com/perryrh0dan/wiki/blob/master/docker-compose.yaml)
2. Download [sample.config.yml](https://github.com/perryrh0dan/wiki/blob/master/sample.config.yml)
3. Rename `sample.config.yml` to `config.yml` and adjust to your needs
4. Run `docker-compose up`

You may run into some problems because the mongodb and the elasticsearch cluster took too long to start and the wiki-server can't connect. To resolve this issue, run the following two commands to start: `docker-compose up wiki-es01 wiki-es02 wiki-mongodb` `docker-compose up wiki-app wiki-server`

## Usage
During the initial setup the default user `admin@admin.com` with the password `admin123` will be created.

## Configuration

### Server
The backend application can be configured with the config.yml file that is mounted into the docker image. 

### In Detail

#### frontend
- Type `string
- necessary

Url of wiki-app. Used to setup CORS and to created linked pages.

#### backend
- Type `string`
- necessary

Url of wiki-server.

#### port
- Type `number`
- necessary

Port wiki-server should listen on

#### db
- Type `string`
- necessary

Database connection string

#### search
- Type `string`
- optional

Elasticsearch connection string. Search will be disabled if empty

#### paths

##### repo
- Type `string`
- necessary

Path to the repo directory where all documents, file and images are stored

##### data
- Type `string`
- necessary

Path to the data directory where all the thumbnails, tempfolders and cache is located.

#### uploads

##### maxImageFileSize
- Type `number`
- optional
- Unit `mb`

##### maxOtherFileSize
- Type `number`
- optional
- Unit `mb`

#### auth

##### defaultAdminEmail
- Type `string`
- optional

#### sessionSecret
- Type `string`
- necessary

Random string that is used as the session secret.

#### git

##### url
- Type `string`
- necessary



### App

## Images

<div align="center">
  <img alt="List" width="70%" src="media/dark_mode.png">
</div>

<div align="center">
  <img alt="List" width="70%" src="media/edit_mode.png">
</div>

<div align="center">
  <img alt="List" width="70%" src="media/search.png">
</div>

<div align="center">
  <img alt="List" width="70%" src="media/user_management.png">
</div>
