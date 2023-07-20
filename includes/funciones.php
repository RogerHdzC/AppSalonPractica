<?php

function debuguear($variable) : string {
    echo "<pre>";
    var_dump($variable);
    echo "</pre>";
    exit;
}

// Escapa / Sanitizar el HTML
function s($html) : string {
    $s = htmlspecialchars($html);
    return $s;
}


function esUltimo(string $actual, string $proximo): bool {
    if($actual !== $proximo){
        return true;
    }else {
        return false;
    }

}

// FUNCION QUE REVISRA QUE EL USUARIO ESTA AUTENTICADO
function isAUTH(): void{
    if(!isset($_SESSION['login'])){
        header("Location: /");
    }
}

function isAdmin() : void {
    if($_SESSION['admin'] === false){
        header('Location: /');
    }
}