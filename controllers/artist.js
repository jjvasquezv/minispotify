'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res){
    var artistId = req.params.id;

    Artist.findById(artistId).then((artist) => {
        if(!artist) {
            res.status(404).send({message: 'El artista no existe'});
        } else {
            res.status(200).send({artist});
        }
    }).catch((error) => {
        res.status(500).send({message: 'No se ha podido procesar la petición de busqueda por artista'});
    });
}

function saveArtist(req, res){
    var artist = new Artist();
    var params = req.body;

    console.log(params);

    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save().then((artistStored) => {
        if(!artistStored){
            res.status(404).send({message: 'El registro de artista no fue almacenado'});
        } else { 
            res.status(200).send({artist: artistStored});
        }
    }).catch((error) => {
        res.status(500).send({message:'Error al guardar registro de artista'});
    });
}

function getArtists(req, res) {
    
    if(req.params.page){
        var page = req.params.page;
    } else {
        var page = 1;
    }
    
    var itemsPerPage = 5;

    Artist.find().sort('name').paginate(page, itemsPerPage).then((artists) => {
        if(!artists){
            res.status(404).send({message: 'No hay artistas'});
        } else {
            return res.status(200).send({
                total_items: artists.length,
                artists: artists
            });
        }
    }).catch((error) => {
        res.status(500).send({message: 'La consulta en busqueda de artistas no ha podido ser procesada'});
    });
}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update).then((artistUpdated) => {
        if(!artistUpdated){
            res.status(404).send({message:'El artista no ha existe'});
        } else { 
            res.status(200).send({artist:artistUpdated});
        } 
    }).catch((error) => {
        res.status(500).send({message:'Error al atualizar registro de artista'});
    });
}


/*
Para la función deleteArtist se ha reemplazado el uso de "findByIdAndRemove" por "findByIdAndDelete"
Tambien se ha reemplazado ".remove()" por ".deleteMany()"
*/
function deleteArtist(req, res){
    var artistId = req.params.id;

    Artist.findByIdAndDelete(artistId).then((artistRemoved) => {
        if(!artistRemoved){
            res.status(404).send({message:'El artista no ha existe, no se puede eliminar.'});
        } else {
            Album.find({artist: artistRemoved._id}).deleteMany().then((albumRemoved) =>{
                if(!albumRemoved){
                    res.status(404).send({message:'No hay albums relacionados al artista, no se puede eliminar.'});
                } else {
                    Song.find({album: albumRemoved._id}).deleteMany().then((songRemoved) => {
                        if (!songRemoved){
                            res.status(404).send({message:'No hay canciones relacionados al artista y sus albums, no se puede eliminar.'});
                        } else {
                            res.status(200).send({artist:artistRemoved});
                        }
                    }).catch((error) => {
                        res.status(500).send({message:'La petición para eliminar las canciones relacionadas con el artista no pudo ser completada'});
                    });
                }
            }).catch((error) => {
                res.status(500).send({message:'La petición para eliminar los albums del artista no pudo ser completada'});
            });
        }
    }).catch((error) => {
        res.status(500).send({message:'La petición para eliminar artista no pudo ser completada' + error});
    });
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || 'jpg' || 'jpeg'  || 'gif'){
            Artist.findByIdAndUpdate(artistId, {image: file_name}).then((artistUpdated) => {
                if(!artistUpdated){
                    res.status(404).send({message: 'El atributo de imágen del usuario no ha podido ser actualizado'});
                } else {
                    res.status(200).send({artist: artistUpdated});
                }
            }).catch((error) => {
                res.status(500).send({message: 'El sistema no ha podido actualizar el atributo de imágen del usuario'});
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
    var path_file = './uploads/artists/'+imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({message: 'No existe la imágen...'})
        }
    });
}

module.exports = {
    getArtist,
    getArtists,
    saveArtist,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}