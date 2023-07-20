<?php

namespace Controllers;

use Classes\Email;
use Model\Usuario;
use MVC\Router;

class LoginController {
    public static function login(Router $router) {

        $alertas = [];
        $auth = new Usuario;

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);
            $alertas = $auth->validarLogin();
            if(empty($alertas)){
                //COMPROBAR QUE EXISTA EL USUARIO
                $usuario = Usuario::where('email',$auth->email);
                if($usuario){
                    //VERIFICAR EL PASSWORD
                    if($usuario->comprobarPasswordAndVerificado($auth->password)){
                        // AUTENTICAR EL USUARIO
                        // session_start();
                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " . $usuario ->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;
                        
                        //REDIRECCIONAMIENTO
                        if($usuario->admin === "1"){
                            $_SESSION['admin'] = true ;
                            header('Location: /admin');
                        }else {
                            $_SESSION['admin'] = false ;
                            header('Location: /cita');
                        }

                    }
                }else {
                    Usuario::setAlerta('error', 'Usuario no encontrado');
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/login', [
            'auth' => $auth,
            'alertas' => $alertas,
        ]);
    }
    
    public static function logout() {
        $_SESSION = [];
        session_destroy();
        header("location:/");
    }
    
    public static function olvide(Router $router) {
        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();
            if(empty($alertas)){
                $usuario = Usuario::where('email', $auth->email);
                if($usuario && $usuario->confirmado === "1"){
                    //GENERAR TOKEN
                    $usuario->crearToken();
                    $usuario->guardar();
                    
                    //EMAIL
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarInstrucciones();

                    //Alerta Exito
                    Usuario::setAlerta('exito', 'Revisa tu Email');


                }else{
                    Usuario::setAlerta('error', 'El usuario no existe o no esta confirmado');
                }
            }
        }
        $alertas = Usuario::getAlertas();

        $router->render('auth/olvide-password',[
            'alertas' => $alertas,
        ]);
    }

    public static function recuperar(Router $router) {
        $alertas=[];
        $error = false;

        $token = s($_GET['token']);

        //BUSCAR USUARIO POR TOKEN
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){
            $error = true;
            Usuario::setAlerta('error', 'Token No Válido');
        }

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $password = new Usuario($_POST);

            $alertas = $password->validarPassword();

            if(empty($alertas)){
                $usuario->password = null;
                $usuario->password = $password->password;
                $usuario->hashPassword();
                $usuario->token = null;

                $resultado = $usuario->guardar();
                if($resultado) {
                    header('Location: /');
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/recuperar-password', [
            'alertas' => $alertas,
            'error' => $error,
        ]);
    }

    public static function crear(Router $router) {

        $usuario = new Usuario;
        //ALERTAS VACIAS
        $alertas = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $usuario->sincronizar($_POST);
            $alertas = $usuario->validarNuevaCuenta();


            //REVISAR QUE ALERTAS ESTE VACIO
            if(empty($alertas)){
                //VERIFICAR QUE EL USUARIO NO ESTE REGISTRADO
                $resultado = $usuario->exiteUsuario();

                if($resultado->num_rows) {
                    $alertas = Usuario::getAlertas();
                } else {
                    //HASHEAR EL PASSWORD
                    $usuario->hashPassword();

                    //GENERAR UN TOKEN ÚNICO
                    $usuario->crearToken();

                    //ENVIAR EMAIL
                    $email = new Email($usuario->email,$usuario->nombre,$usuario->token);

                    $email->enviarConfirmacion();

                    //CREAR EL USAURIO
                    $resultado = $usuario->guardar();
                    if($resultado) {
                        header('Location: /mensaje');
                    }
                    
                }
            }

        }

        $router->render('auth/crear-cuenta', [
            'usuario' => $usuario,
            'alertas' => $alertas,
        ]);
    }

    public static function mensaje(Router $router) {
        $router->render('auth/mensaje', [
            
        ]);
    }
    
    public static function confirmar(Router $router) {
        $alertas = [];
        $token = s($_GET['token']);
        $usuario = Usuario::where('token', $token);
        if(empty($usuario)) {
            //MOSTRAR MENSAJE ERROR
            Usuario::setAlerta('error', 'Token No Válido');
        }else {
            //MODIFICAR A USAURIO CONFIRMADO
            $usuario->confirmado = 1;
            $usuario->token= '';
            $usuario->guardar();
            Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente');
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }
    
}