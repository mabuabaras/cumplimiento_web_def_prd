document.addEventListener('DOMContentLoaded', function () {
    var currentSectionIndex = 0;
    var sections = document.querySelectorAll('.form-section');
    var prevButton = document.getElementById('prevButton');
    var nextButton = document.getElementById('nextButton');
    var submitButton = document.getElementById('submitButton');
    var anonymityRadioButtons = document.querySelectorAll('input[name="anonymity"]');
    var enrollerGroup = document.getElementById('enrollerGroup');

    sections.forEach(function (section, index) {
        if (index !== 0) section.style.display = 'none';
    });

    function areRequiredFieldsFilled(sectionIndex) {
        var section = sections[sectionIndex];
        var requiredFields = section.querySelectorAll('[required]');

        for (var i = 0; i < requiredFields.length; i++) {
            if (requiredFields[i].value.trim() === '') {
                return false; // Al menos un campo requerido está vacío
            }
        }

        return true; // Todos los campos requeridos están llenos
    }

    function showCurrentSection() {
        sections.forEach(function (section, index) {
            section.style.display = index === currentSectionIndex ? 'block' : 'none';
        });

        // Actualiza el marcador de progreso
        var steps = document.querySelectorAll('.step');
        steps.forEach(function (step, index) {
            if (index === currentSectionIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    prevButton.addEventListener('click', function () {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            showCurrentSection();
            updateButtonVisibility();
        }
    });

    nextButton.addEventListener('click', function () {
        if (currentSectionIndex < sections.length - 1) {
            if (areRequiredFieldsFilled(currentSectionIndex)) {
                currentSectionIndex++;
                showCurrentSection();
                updateButtonVisibility();
            } else {
                alert('Por favor, complete todos los campos requeridos antes de continuar.');
            }
        }
    });

    submitButton.addEventListener('click', function (event) {
        event.preventDefault(); // Evitar que se recargue la página
        sendDataToEndpoint(); // Llamar a la función para enviar datos al endpoint
    });

    function updateButtonVisibility() {
        prevButton.style.display = currentSectionIndex > 0 ? 'inline-block' : 'none';
        nextButton.style.display = currentSectionIndex < sections.length - 1 ? 'inline-block' : 'none';
        submitButton.style.display = currentSectionIndex === sections.length - 1 ? 'inline-block' : 'none';
    }

    function sendDataToEndpoint() {
        // Crear un objeto para almacenar todos los campos del formulario
        var formData = {};

        // Obtener todos los elementos de formulario dentro del formulario con el id "reportForm"
        var formElements = document.getElementById('reportForm').elements;

        // Iterar a través de los elementos del formulario y agregarlos al objeto formData
        for (var i = 0; i < formElements.length; i++) {
            var element = formElements[i];
            if (element.type !== 'submit' || element.name === '') { // Excluir el botón de envío
                formData[element.name] = element.value;
            }
        }

        // Eliminar las entradas con valores vacíos o indefinidos
        for (var key in formData) {
            if (formData.hasOwnProperty(key) && (formData[key] === "" || formData[key] === undefined)) {
                delete formData[key];
            }
        }


        // Construir el objeto jsonData con todos los campos del formulario en valueModel
        // Construir el objeto jsonData con los datos predefinidos
        var jsonData = {
            firstName: "", // Agregar los valores correspondientes
            secondName: "", // Agregar los valores correspondientes
            firstSurname: "", // Agregar los valores correspondientes
            secondSurname: "", // Agregar los valores correspondientes
            typeDocument: "", // Agregar los valores correspondientes
            document: "", // Agregar los valores correspondientes
            name: document.querySelector('input[name="name"]').value, // Usar el campo "name" del formulario
            typePerson: "",
            rol: "17",
            codePerson: "",
            codeModel: "ALERTAMASIVA",
            typeModel: "3",
            valueAlert: "1000000",
            score: "500",
            description: "Operaciones Inusuales",
            valueModel: []
        };

        // Combinar los datos del formulario con los datos predefinidos
        // var formData = {
        //     report: document.querySelector('input[name="report"]:checked').value,
        //     detailedDescription: document.getElementById('detailedDescription').value,
        //     name: document.querySelector('input[name="name"]').value,
        //     position: document.querySelector('input[name="position"]').value,
        //     involved_type: document.querySelector('select[name="involved_type"]').value,
        //     type: document.querySelector('input[name="type"]:checked').value,
        //     subtype: document.querySelector('input[name="subtype"]:checked').value,
        //     country: document.querySelector('input[name="country"]:checked').value,
        //     sector: document.querySelector('input[name="sector"]:checked').value,
        //     place: document.getElementById('place').value,
        //     lapse: document.getElementById('lapse').value
        // };

        // Agregar formData al array valueModel
        jsonData.valueModel.push(formData);

        // Convertir el objeto jsonData en una cadena JSON
        var jsonString = JSON.stringify([jsonData]);

        console.log('Datos del formulario:', formData);
        console.log('Datos JSON a enviar:', jsonData);

        // Configurar la solicitud POST
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Basic d3MudGVzdDpNd013OEs1QypTUkJHOA==");
        myHeaders.append("Cookie", "XSRF-TOKEN=eyJpdiI6ImlSR2VFWlp3Ry9PbDErdjJ2cXNsb0E9PSIsInZhbHVlIjoiNUNNejc0TXp1Q09Ub0pmYlJobkUzYWxTdDd4OUJ3V2NHaEFYZjVCL2VPa3FXU1plN1RCY2wxYk1pRnMwOXJvTzI1WmxlMjM3L3FnYTZnZ08xa0VtTDlEeWJFT0k3R2hTWFhwcy9OQnZMU2tjUVVZNFgzUmtLakhJRHFKc282aU0iLCJtYWMiOiI4NDAwZjA0ZTcxNGQxYjc5Njk2ZTQwMDFlYmJkMmUzYWVlOTc5Yjg5NzcwMWM5NTI4NTY4ZjcxNmI2OTA1YmE1IiwidGFnIjoiIn0%3D; case_manager_session=eyJpdiI6ImhrRUZkYjF5QisvWFQrOG1DV3h1Mmc9PSIsInZhbHVlIjoicVJ5WEMrYkRiMVdyTlBNWFlNcmlQczIxWTZydUdoMU1PeTlNR0tPZVcxbXNlZG9xU3JwYzJjeG1IRWNvOS9WRW5aOUgvS2UwUHppN1pLNTE0MkxuZmN0cTVrc2JpWCtqRGRJL285SUdZTDZaNmlqeEtvb3NUZ3dIUmJkQml2SmEiLCJtYWMiOiJlMTk2YzQ3ZjM5ZTQ1NGE0YThlMTMyZmM1YzAxMGE0ZjhlZmVjOTIyYjJmODUwMWUyZTdiYTIwYmU0NmJiNjY0IiwidGFnIjoiIn0%3D");

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: jsonData,
            credentials: 'include', // Configurar para incluir credenciales
            redirect: 'follow'
        };

        // Enviar la solicitud al endpoint
        fetch("https://mxsdcm.stradata.com.co/api/v1/cases/store", requestOptions)
            .then(response => response.text())
            .then(result => {
                // Mostrar los datos enviados y la respuesta en el modal
                document.getElementById('sentData').textContent = jsonData;
                document.getElementById('serverResponse').textContent = result;

                // Mostrar el modal
                var responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
                responseModal.show();
            })
            .catch(error => {
                // Manejar errores y mostrarlos en el modal
                document.getElementById('sentData').textContent = jsonData;
                document.getElementById('serverResponse').textContent = 'Error al enviar los datos:\n' + error;

                // Mostrar el modal
                var responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
                responseModal.show();
            });
    }

    function createRadioButtonsForType(typeData) {
        var tipoContainer = document.getElementById('type');
        var subtipoContainer = document.getElementById('subtype');
        var subtipoLabel = document.getElementById('subtypeLabel');

        typeData.forEach(function (type) {
            var tipoLabel = document.createElement('label');
            tipoLabel.textContent = type.tipo;
            tipoLabel.setAttribute('class', 'choice fade')

            var tipoRadio = document.createElement('input');
            tipoRadio.setAttribute('type', 'radio');
            tipoRadio.setAttribute('name', 'type');
            tipoRadio.setAttribute('value', type.tipo);

            // Establecer el atributo checked si es 'LAFT'
            if (type.tipo === 'LAFT') {
                tipoRadio.setAttribute('checked', 'checked');
                tipoRadio.setAttribute('disabled', 'disabled'); // Deshabilitar el radio button para que no se pueda modificar
                showSubtypesForType('LAFT'); // Mostrar subtipos para LAFT automáticamente
            }
            else {
                tipoRadio.setAttribute('disabled', 'disabled'); // Deshabilitar el radio button para que no se pueda modificar
            }

            tipoContainer.appendChild(tipoRadio);
            tipoContainer.appendChild(tipoLabel);

            tipoRadio.addEventListener('click', function () {
                showSubtypesForType(this.value); // Mostrar subtipos al hacer clic en un tipo
            });
        });

        function showSubtypesForType(typeName) {
            subtipoContainer.innerHTML = '';
            subtipoLabel.textContent = typeName.toUpperCase() + " (ESTE CAMPO ES OPCIONAL)";
            subtipoLabel.style.display = 'block';
            subtipoContainer.style.display = 'block';
            subtipoLabel.setAttribute('class', 'all-caps fs-12 bold')
            typeData.find(function (type) {
                return type.tipo === typeName;
            }).subtipos.forEach(function (subtipo) {
                var subtipoLabel = document.createElement('label');
                subtipoLabel.textContent = subtipo;
                var subtipoRadio = document.createElement('input');
                subtipoRadio.setAttribute('type', 'radio');
                subtipoRadio.setAttribute('name', 'subtype');
                subtipoRadio.setAttribute('value', subtipo);
                subtipoRadio.setAttribute('class', 'choice fade')
                subtipoContainer.appendChild(subtipoRadio);
                subtipoContainer.appendChild(subtipoLabel);
            });
        }
    }


    function createRadioButtonsForDivision(divisionData) {
        var countryContainer = document.getElementById('country');
        var sectorContainer = document.getElementById('sector');
        var sectorLabel = document.getElementById('sectorLabel');

        divisionData.forEach(function (country) {
            var countryLabel = document.createElement('label');
            countryLabel.textContent = country.country;
            countryLabel.setAttribute('class', 'choice')
            var countryRadio = document.createElement('input');
            countryRadio.setAttribute('type', 'radio');
            countryRadio.setAttribute('name', 'country');
            countryRadio.setAttribute('value', country.country);

            // Establecer el atributo checked si es 'México'
            if (country.country === 'México') {
                countryRadio.setAttribute('checked', 'checked');
                countryRadio.setAttribute('disabled', 'disabled'); // Deshabilitar el radio button para que no se pueda modificar
                showSectorsForCountry('México'); // Mostrar sectores para México automáticamente
            }
            else {
                countryRadio.setAttribute('disabled', 'disabled'); // Deshabilitar el radio button para que no se pueda modificar
            }

            countryContainer.appendChild(countryRadio);
            countryContainer.appendChild(countryLabel);

            countryRadio.addEventListener('click', function () {
                showSectorsForCountry(this.value); // Mostrar sectores al hacer clic en un país
            });
        });

        function showSectorsForCountry(countryName) {
            sectorContainer.innerHTML = '';
            sectorContainer.style.display = 'block';

            divisionData.find(function (country) {
                return country.country === countryName;
            }).sectors.forEach(function (sector) {
                var sectorLabel = document.createElement('label');
                sectorLabel.textContent = sector;
                var sectorRadio = document.createElement('input');
                sectorRadio.setAttribute('type', 'radio');
                sectorRadio.setAttribute('name', 'sector');
                sectorRadio.setAttribute('value', sector);
                sectorContainer.appendChild(sectorRadio);
                sectorContainer.appendChild(sectorLabel);
            });
        }
    }

    anonymityRadioButtons.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (this.value === '0') {
                enrollerGroup.style.display = 'block';
            } else {
                enrollerGroup.style.display = 'none';
                // Opcional: Limpia el valor del campo cuando se selecciona "Anónimo"
                document.getElementById('enroller').value = '';
            }
        });
    });

    fetch('test.json')
        .then(function (response) { return response.json(); })
        .then(function (jsonData) {
            // createRadioButtonsForType(jsonData.tipos);
            // createRadioButtonsForDivision(jsonData.division);
        })
        .catch(function (error) {
            console.error('Error al cargar JSON:', error);
        });

    showCurrentSection();
    updateButtonVisibility();
});
