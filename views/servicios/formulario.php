
    <div class="campo">
        <label for="nombre">Nombre</label>
        <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Coloca el nombre del nuevo servicio"
            value="<?php echo $servicio->nombre ?? null?>"
        />
    </div>
    <div class="campo">
        <label for="precio">Precio</label>
        <input
            type="text"
            id="precio"
            name="precio"
            placeholder="Coloca el precio del nuevo servicio"
            value="<?php echo $servicio->precio ?? null?>"
        />
    </div>
