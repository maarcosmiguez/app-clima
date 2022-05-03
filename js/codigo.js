let apikey = "a7f6a07fc5d9c843e28db7dcbec62d16";
let units = "metric";
let ciudad = "";

// DOM
let $divClima = document.querySelector("#clima");
let $divLlovidos = document.querySelector("#diasLlovidos");
let $ciudadIngresada = document.querySelector("#txt_ciudad");
let $btMostrar = document.querySelector("#bt_mostrar");
let $info = document.querySelector("#info");
let $cargando = document.querySelector(".preloader");
let $divCargando = document.querySelector("#cargando");

//EVENTOS
$btMostrar.addEventListener("click", mostrarClima);

function mostrarClima() {
  function mostrarInfo() {
    $info.style.display = "block";
    $cargando.style.display = "block";
  }

  function ocultarCargando() {
    $cargando.style.display = "none";
  }

  mostrarInfo();

  let ciudadElegida = $ciudadIngresada.value;
  if (ciudadElegida != "") {
    mostrarDatos();
  } else {
    mostrarError();
  }

  function mostrarDatos() {
    ciudad = ciudadElegida;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apikey}&units=${units}&lang=es`
    )
      .then((respuesta) => respuesta.json())
      .then(datos);

    function datos(datos) {
      console.log(datos);
      let latitud = datos.coord.lat;
      let longitud = datos.coord.lon;
      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitud}&lon=${longitud}&exclude=hourly,minutely&units=metric&lang=es&appid=${apikey}`
      )
        .then((respuesta) => respuesta.json())

        .then(datosDaily)

        .finally(ocultarCargando());

      function datosDaily(datosDaily) {
        console.log(datosDaily);
        console.log(datosDaily.daily);
        // $info.innerHTML = "";

        // CALC TEMPERATURA PROMEDIO
        let tempSumadas = 0;
        datosDaily.daily.forEach((arr) => {
          let tempMaxProm = Math.round(arr.temp.max);
          let tempMinProm = Math.round(arr.temp.min);
          tempSumadas += (tempMinProm + tempMaxProm) / 2;
        });
        let promedioTemp = tempSumadas / datosDaily.daily.length;
        let promedioTempRound = Math.round(promedioTemp);
        $divClima.innerHTML = `
          <span class="material-symbols-outlined"> thermostat </span>
          <p>En <strong>${ciudad}</strong>, la temperatura promedio de la semana sera de ${promedioTempRound}°.</p>`;
        console.log(promedioTempRound);

        // CALC DIAS DE LLUVIA
        let diasConLluvia = [];
        let lluvia = [];

        datosDaily.daily.forEach((arr) => {
          lluvia.push(arr.rain);
          myArrClean = lluvia.filter(Boolean);
          diasConLluvia = myArrClean.length;
          console.log(diasConLluvia);

          diasConLluvia != 0
            ? diasConLluvia != 1
              ? ($divLlovidos.innerHTML = `
                <span class="material-symbols-outlined"> rainy </span>
                <p>Van a <strong>llover ${diasConLluvia} días</strong> en la próxima semana. Mmm...</p>`)
              : ($divLlovidos.innerHTML = `
                <span class="material-symbols-outlined">umbrella</span>
                <p>Va a <strong>llover ${diasConLluvia} día</strong> en la próxima semana. ¡No es tan grave!</p>`)
            : ($divLlovidos.innerHTML = `<span class="material-symbols-outlined">
              wb_twilight
              </span>
                <p><strong>No lloverá</strong> ningún día en la próxima semana. ¡Buena señal!</p>`);
        });

        if (diasConLluvia < 1 && promedioTemp > 21) {
          $divLlovidos.insertAdjacentHTML(
            "beforeend",
            `<div class="conclusion"><img src="img/icons/clear.svg" alt="icono de soleado" srcset=""><br>
              <h4>¿Es una buena idea ir esta semana?</h4>
              <p>No va a llover y va a hacer calor... ¡Es ahora!</p></div>
          `
          );
        } else if (diasConLluvia < 2 && promedioTemp > 18) {
          $divLlovidos.insertAdjacentHTML(
            "beforeend",
            `<div class="conclusion">
              <img src="img/icons/cloud.svg" alt="icono de nublado" srcset=""><br>
              <h4>¿Es una buena idea ir esta semana?</h4>
              <p>Caluroso y poca lluvia.. ¡Buen plan!</p></div>
          `
          );
        } else if (diasConLluvia < 3 || promedioTemp > 14) {
          $divLlovidos.insertAdjacentHTML(
            "beforeend",
            `
             
              <div class="conclusion">
              <img src="img/icons/rain.svg" alt="icono de lluvia" srcset=""><br>
              <h4>¿Es una buena idea ir esta semana?</h4>
              <p>Puede ser, ¡pero no te esperes el Caribe!</p></div>
          `
          );
        } else {
          $divLlovidos.insertAdjacentHTML(
            "beforeend",
            `
              <div class="conclusion">
              <img src="img/icons/storm.svg" alt="icono de tormenta" srcset=""><br>
              <h4>¿Es una buena idea ir esta semana?</h4>
              <p>Tal vez lo mejor sea esperar un poco...</p>
          </div>`
          );
        }
      }
    }
  }

  function mostrarError() {
    $divClima.innerHTML = `<p class="error"> Ingrese una ciudad o un departamento </p>`;
    $info.classList.add("width70");
    return;
  }
}
