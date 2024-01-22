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
        var emailField = section.querySelector('input[type="text"][name="email"]');

        for (var i = 0; i < requiredFields.length; i++) {
            if (requiredFields[i].name === "email") {
                // Si el campo de email está presente pero no está vacío, verifica su formato.
                if (emailField && emailField.value.trim() !== '' && !isValidEmail(emailField.value.trim())) {
                    alert('Por favor, ingrese un email válido.');
                    return false;
                }
            } else if (requiredFields[i].value.trim() === '') {
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
        var formData = {};
        var formElements = document.getElementById('reportForm').elements;

        for (var i = 0; i < formElements.length; i++) {
            var element = formElements[i];
            if (element.type !== 'submit' && element.name !== '') {
                formData[element.name] = element.value;
            }
        }

        for (var key in formData) {
            if (formData.hasOwnProperty(key) && (formData[key] === "" || formData[key] === undefined)) {
                delete formData[key];
            }
        }

        var jsonData = {
            "name": document.querySelector('input[name="name"]').value,
            "typePerson": "F",
            "rol": "17",
            "codeModel": "ALERTAMANUAL",
            "typeModel": "6",
            "valueAlert": "1000000",
            "score": "500",
            "description": formData['detailedDescription'],
            "valueModel": [formData]
        };

        var jsonString = JSON.stringify([jsonData]);
        console.log('Datos del formulario:', formData);
        console.log('Datos JSON a enviar:', jsonData);

        var xhr = new XMLHttpRequest();
        //xhr.open('POST', 'http://localhost:7071/api/af_web_cumplimiento', true);
        xhr.open('POST', 'https://af-web-form.azurewebsites.net/api/af_web_cumplimiento?', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // xhr.onreadystatechange = function () {
        //     if (xhr.readyState === XMLHttpRequest.DONE) {
        //         document.getElementById('sentData').textContent = jsonString;
        //         document.getElementById('serverResponse').textContent = xhr.status === 200 ? xhr.responseText : xhr.statusText;
        //
        //
        //
        //         var responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
        //         responseModal.show();
        //     }
        // };

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var sentDataElement = document.getElementById('sentData');
                var serverResponseElement = document.getElementById('serverResponse');
                if (sentDataElement) sentDataElement.textContent = jsonString;
        
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.casesSuccess && response.casesSuccess.length > 0 && response.casesSuccess[0].infoCreatedCase) {
                        var caseID = response.casesSuccess[0].infoCreatedCase.caseID;
                        alert("Case ID: " + caseID); // Mostrar el alerta con el case ID
                    } else {
                        alert("No se encontró información de Case ID en la respuesta.");
                    }
                } else {
                    if (serverResponseElement) serverResponseElement.textContent = xhr.statusText;
                }
        
                var responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
                if (responseModal) responseModal.show();
            }
        };

        try {
            console.log('Enviando JSON:', jsonString);
            xhr.send(jsonString);

            // window.alert('Okay, si estas seguro.');
        } catch (error) {
            console.error('Error al enviar la solicitud AJAX:', error);
            document.getElementById('sentData').textContent = jsonString;
            document.getElementById('serverResponse').textContent = 'Error al enviar la solicitud AJAX: ' + error.message;

            var responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
            responseModal.show();
        }
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
