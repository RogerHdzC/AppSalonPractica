
<h1 class="nombre-pagina"> login</h1>
<p class="descripcion-pagina">Inicia sesión con tus datos</p>

<?php include_once __DIR__ . "/../templates/alertas.php";?>


<form class="formulario" method="POST" action="/" >
    <div class="campo">
        <label for="email">Email</label>
        <input
            type="email"
            id="email"
            name="email"
            placeholder="Tu Email"
            value="<?php echo s($auth->email) ?>"
        />
    </div>
    <div class="campo">
        <label for="password">Password</label>
        <input
            type="password"
            id="password"
            name="password"
            placeholder="Tu Password"
        />
    </div>
    <input type="submit" class="boton" value="Iniciar Sesion"/>
</form>

<div class="acciones">
    <a href="/crear-cuenta">¿Aún no tienes un cuenta? Crea una</a>
    <a href="/olvide">¿Olvidaste u password?</a>
</div>