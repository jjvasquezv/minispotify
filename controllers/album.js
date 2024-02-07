'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({ path: 'artist' }).exec().then((album) => {
        if (!album) {
            res.status(404).send({ message: 'El album no existe' });
        } else {
            res.status(200).send({ album });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error en la petición' });
    });
}

function getAlbums(req, res) {
    var artistId = req.params.artist;

    if (!artistId) {
        var find = Album.find({}).sort('title');
    } else {
        var find = Album.find({ artist: artistId }).sort('year');
    }

    find.populate({ path: 'artist' }).exec().then((albums) => {
        if (!albums) {
            res.status(404).send({ message: 'No hay Albums' });
        } else {
            res.status(200).send({ albums });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error en la petición de albums' });
    });

}

function saveAlbum(req, res) {
    var album = new Album();
    var params = req.body;

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save().then((albumStored) => {
        if (!albumStored) {
            res.status(404).send({ message: 'El registro de album no fue almacenado' });
        } else {
            res.status(200).send({ album: albumStored });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error al guardar registro de nuevo album' });
    });
}

function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update).then((albumUpdated) => {
        if (!albumUpdated) {
            res.status(404).send({ message: 'El album no ha sido actualizado' });
        } else {
            res.status(200).send({ album: albumUpdated });
        }
    }).catch((error) => {
        res.status(500).send({ message: 'Error al atualizar registro de album' });
    });

}

function deleteAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).deleteMany().then((albumRemoved) => {
        if (!albumRemoved) {
            res.status(404).send({ message: 'No hay albums relacionados al artista, no se puede eliminar.' });
        } else {
            Song.find({ album: albumRemoved._id }).deleteMany().then((songRemoved) => {
                if (!songRemoved) {
                    res.status(404).send({ message: 'No hay canciones relacionados al artista y sus albums, no se puede eliminar.' });
                } else {
                    res.status(200).send({ album: albumRemoved });
                }
            }).catch((error) => {
                res.status(500).send({ message: 'La petición para eliminar las canciones relacionadas con el album no pudo ser completada' });
            });
        }
    }).catch((error) => {
        console.log(error);
        res.status(500).send({ message: 'La petición para eliminar el album no pudo ser completada' });
    });
}

function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || 'jpg' || 'jpeg'  || 'gif'){
            Album.findByIdAndUpdate(albumId, {image: file_name}).then((albumUpdated) => {
                if(!albumUpdated){
                    res.status(404).send({message: 'El atributo de imágen del album no ha podido ser actualizado'});
                } else {
                    res.status(200).send({album: albumUpdated});
                }
            }).catch((error) => {
                res.status(500).send({message: 'El sistema no ha podido actualizar el atributo de imágen del album'});
            });
        } else {
            res.status(200).send({message: 'Tipo de archivo no permitido'});
        }

        console.log(file_split);
        } else {
            res.status(200).send({message: 'No ha subido ninguna imágen'});
        }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/albums/'+imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({message: 'No existe la imágen...'})
        }
    });
}

module.exports = {
    getAlbum,
    getAlbums,
    saveAlbum,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}