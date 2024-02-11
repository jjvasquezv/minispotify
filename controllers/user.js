'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


function pruebas(req, res){
    res.status(200).send({
        message: 'Probando una acción del controlador'
    });
}

function saveUser(req, res){
    var user = new User();

    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if (params.password){
        // Encriptar contraseña

        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password = hash;
            if (user.name != null && user.surname != null && user.email != null) {
                // Guardar el usuario
                user.save().then((userStored) => {
                    if(!userStored){
                        res.status(404).send({message:'El registro de usuario no fua almacenado'});
                    } else {
                        res.status(200).send({message:'El usuario ha sido creado'});
                    }
                }).catch(error => {
                    res.status(500).send({message:'Error al guardar registro de usuario'});
                })
            } else {
                res.status(200).send({message:'Complete todos los campos'});
            }
        });

    } else {
        res.status(500).send({message:'Introduce la contraseña'});
    }
}

function loginUser(req,res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}).then((user)  => {
        if(!user){
            res.status(404).send({message: 'El usuario no existe'});
        } else {
            //Comprobar la contraseña
            bcrypt.compare(password, user.password, function(err, check){
                if(check){
                    //devolver los datos del usuario logeado
                    if(params.gethash){
                        //Devolver un token de JWT
                        res.status(200).send({
                            token: jwt.createToken(user),
                        });
                    } else {
                        res.status(200).send({user});
                    }
                } else {
                    res.status(404).send({message: 'Contraseña incorrecta, no puede iniciar sesión'});
                }
            });
        }
    }).catch((error) => {
        res.status(500).send({message: 'Ha ocurrido un error en la petición de inicio de sesión'});
    });

}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update).then((userUpdated) => {
        if(!userUpdated){
            res.status(404).send({message: 'El usuario no ha podido ser actualizado'});
        } else {
            res.status(200).send({user: userUpdated});
        }
    }).catch((error) => {
        res.status(500).send({message: 'El sistema no ha podido ejecutar la actualización'});
    });
}

function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || 'jpg' || 'jpeg'  || 'gif'){
            User.findByIdAndUpdate(userId, {image: file_name}).then((userUpdated) => {
                if(!userUpdated){
                    res.status(404).send({message: 'El atributo de imágen del usuario no ha podido ser actualizado'});
                } else {
                    res.status(200).send({image: file_name, user: userUpdated});
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
    var path_file = './uploads/users/'+imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({message: 'No existe la imágen...'})
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};