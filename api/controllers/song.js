'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;

    Song.findById(songId).populate({ path: 'album' }).exec().then((song) => {
        if (!song) {
            res.status(404).send({ message: 'La canción no existe' });
        } else {
            res.status(200).send({ song });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error en la petición de búsqueda de canción' });
    });
}

function getSongs(req, res) {
    var albumId = req.params.album;

    if (!albumId) {
        var find = Song.find({}).sort('number');
    } else {
        var find = Song.find({ album: albumId }).sort('number');
    }

    find.populate({ 
        path: 'album', 
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec().then((songs) => {
        if (!songs) {
            res.status(404).send({ message: 'No hay Canciones' });
        } else {
            res.status(200).send({ songs });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error en la petición de canciones' });
    });

}

function saveSong(req, res) {
    var song = new Song();
    var params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = 'null';
    song.album = params.album;

    song.save().then((songStored) => {
        if (!songStored) {
            res.status(404).send({ message: 'El registro de canción no fue almacenado' });
        } else {
            res.status(200).send({ song: songStored });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error al guardar registro de nueva canción' });
    });
}

function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update).then((songUpdated) => {
        if (!songUpdated) {
            res.status(404).send({ message: 'La canción no ha sido actualizado' });
        } else {
            res.status(200).send({ song: songUpdated });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error al atualizar registro de canción' });
    });

}

function deleteSong(req, res) {
    var songId = req.params.id;

    Song.findByIdAndDelete(songId).then((songRemoved) => {
        if (!songRemoved){
            res.status(404).send({ message: 'No se ha borrado la canción.' });
        } else {
            res.status(200).send({ song: songRemoved });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'La petición para eliminar esta canción no pudo ser completada' });
    });
}

function uploadFile(req, res){
    var songId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'mp3' || 'mp4' || 'ogg'  || 'gif'){
            Song.findByIdAndUpdate(songId, {file: file_name}).then((songUpdated) => {
                if(!songUpdated){
                    res.status(404).send({message: 'El archivo de canción no ha podido ser actualizado'});
                } else {
                    res.status(200).send({song: songUpdated});
                }
            }).catch((error) => {
                res.status(500).send({message: 'El sistema no ha podido actualizar archivo de canción'});
            });
        } else {
            res.status(200).send({message: 'Tipo de archivo no permitido'});
        }

        console.log(file_split);
        } else {
            res.status(200).send({message: 'No ha subido ninguna canción'});
        }
}

function getSongFile(req, res){
    var songFile = req.params.songFile;
    var path_file = './uploads/songs/'+songFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({message: 'No existe el archivo de canción...'})
        }
    });
}

module.exports = {
    getSong,
    getSongs,
    saveSong,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}