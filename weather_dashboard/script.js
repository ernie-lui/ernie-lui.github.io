const fetchOpenMeteoData = async function(varString, pastDays = 30) {
    try {
        const OPENMETEO_URL = 
            `https://api.open-meteo.com/v1/forecast?latitude=61.4991&longitude=23.7871&hourly=${varString}&wind_speed_unit=ms&timezone=auto&past_days=${pastDays}&forecast_days=0`;
            const response = await fetch(OPENMETEO_URL);
            const parsedResponse = await response.json();
            const hourlyObj = parsedResponse.hourly;
            return {
                units: parsedResponse.hourly_units,
                data: hourlyObj,
                dateTimeStrings: hourlyObj.time,
                dateStrings: hourlyObj.time.map(dateTimeString => dateTimeString.slice(0, 10)),
                hourStrings: hourlyObj.time.map(dateTimeString => dateTimeString.slice(-5).slice(0,2))
            };
    } catch (error) {
        console.error(error);
    }
};

/**
 * Adds (or subtracts) days from a date string.
 * @param dateString is in format "YYYY-MM-DD".
 * @param addend is number of days to be added to dateString date.
 *                  (if negative days will be subtracted)
 * @return resulting date in format "YYYY-MM-DD".
 */
const addToDateString = function(dateString, addend) {
    let date = new Date(dateString);
    date.setDate(date.getDate() + addend);
    return date.toISOString().slice(0, 10);
}

/**
 * Function to create a table row with array data.
 * @param array of data
 * @param name of the data variable in array
 * @return row, which can be <tbody> element.
 */ 
function createRow(array, name) {
    const row = document.createElement('tr');

    // First cell with the array name
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    row.appendChild(nameCell);

    // Cells with array elements
    array.forEach(element => {
        const cell = document.createElement('td');
        cell.textContent = element;
        row.appendChild(cell);
    });

    return row;
}

const runScripts = async () => {
    try {
        const varStrings = [
            "temperature_2m",
            "precipitation",
            "wind_speed_10m",
            "relative_humidity_2m",
            "apparent_temperature",
            "cloud_cover",
            "wind_gusts_10m",
            "direct_radiation"
        ];
        // fetch above variables from Open Meteo API
        const dataObj = await fetchOpenMeteoData(varStrings.join(','));
        // console.log(dataObj);

        // DASHBOARD ATTRIBUTES / INIT VARIABLES
        let currentWeatherVariable = varStrings[0]; // intialize to "temperature_2m"
        // range of dates spanned by fetched dataObj
        const minDateString = dataObj.dateStrings[0];
        const maxDateString = dataObj.dateStrings[dataObj.dateStrings.length -1];
        // chart slider variables
        const chartSlider = document.getElementById('chart-slider');
        // integerInput (for Descriptive Statistics) variables
        const integerInput = document.getElementById("integer-input");
        document.getElementById('desc-stat-units').textContent =
            "(" + dataObj.units[currentWeatherVariable] + ")"; // display units
        // date picker attributes
        const datePicker = document.getElementById('date-picker');
        datePicker.max = maxDateString;
        datePicker.min = minDateString;
        datePicker.value = maxDateString; // initialize to most recent date


        // CHART
        // ChartJS Object
        const myChart = new Chart("my-chart", {
            type: "bar",
            data: {
                labels: dataObj.dateTimeStrings.slice(-24 * chartSlider.value),
                datasets: [{
                    data: dataObj.data[currentWeatherVariable].slice(-24 * chartSlider.value)
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: currentWeatherVariable + ", hourly data, past " + chartSlider.value + " days",
                        font: {size: 18}
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: dataObj.units[currentWeatherVariable]
                        }
                    }
                }
            }
        });
        /**
         * Function for updating myChart. Used when
         * 'currentWeatherVariable' or 'chartSlider.value' are changed.
         */
        function updateMyChart(chart = myChart) {
            chart.options.plugins.title.text = currentWeatherVariable + ", hourly data, past " + chartSlider.value + " days";
            chart.data.labels = dataObj.dateTimeStrings.slice(-24 * chartSlider.value);
            chart.data.datasets[0].data = dataObj.data[currentWeatherVariable].slice(-24 * chartSlider.value);
            chart.options.scales.y.title.text = dataObj.units[currentWeatherVariable];
            chart.update();
        }

        // Chart Slider Event Listener
        chartSlider.addEventListener('input', function() {
            updateMyChart();
        });

        // DESCRIPTIVE STATS
        /**
         * Function for updating/populating Descriptive Stats table.
         */
        function updateStats(
            variable = currentWeatherVariable,
            pastDays = parseInt(integerInput.value),
            tableBody = document.getElementById("desc-stat-body"),
            statStrings = ['mean', 'median', 'mode', 'stdev', 'max / min', 'range'],
            dataObject = dataObj) {
                const data = dataObject.data[variable].slice(-24 * pastDays);
                // create Statistics object
                const stat = new Statistics(
                    data.map(elem => ({x: elem})), {x: 'interval'}
                );
                // calculate
                const statValues = [
                    stat.arithmeticMean("x"),
                    stat.median("x"),
                    stat.mode("x"),
                    stat.standardDeviation("x"),
                    stat.maximum("x") + " / " + stat.minimum("x"),
                    stat.range("x")
                ];
                const statValueStrings = statValues.map(num => {
                    if (num.toString().length > 13) {
                        return num.toFixed(2);
                    }
                    return num.toString();
                });
                // delete rows from tableBody, if they exist
                while (tableBody.firstChild) {
                    tableBody.removeChild(tableBody.firstChild);
                }
                // populate table
                for (i = 0; i < statStrings.length; i++) {
                    // console.log(statValueStrings[i]);
                    // statistic name as <th>
                    const row1 = document.createElement('tr');
                    const cell1 = document.createElement('th');
                    cell1.textContent = statStrings[i];
                    row1.appendChild(cell1);
                    tableBody.appendChild(row1);
                    // statistic value as <td>
                    const row2 = document.createElement('tr');
                    const cell2 = document.createElement('td');
                    cell2.textContent = statValueStrings[i];
                    row2.appendChild(cell2);
                    tableBody.appendChild(row2);
                // update units in stats table
                document.getElementById('desc-stat-units').textContent =
                    "(" + dataObject.units[variable] + ")";
                }
        }
        updateStats();

        integerInput.addEventListener('input', function() {
            // check inputted value
            const value = parseInt(integerInput.value);
            if (isNaN(value) || value < 1) {
                integerInput.value = 1;
            } else if (value > 30) {
                integerInput.value = 30;
            }
            updateStats();
        });


        // TABLE DISPLAYS HOURLY READINGS for datePicker date.
        // Only displays 1 day at a time so table doesn't get too long.
        // User can select date with datePicker.
        const updateTable = function(dateString = datePicker.value, variable = currentWeatherVariable) {
            document.getElementById("table-heading").textContent = 
                variable + ", hourly data, " + dateString;

            // Search for subset of data that corresponds to arguments passed.
            // Find indices in data corresponding to dateString
            const startIndex = dataObj.dateStrings.indexOf(dateString);
            const endIndex = dataObj.dateStrings.lastIndexOf(dateString);
            // Slice time and data arrays
            const hourStringsSlice = dataObj.hourStrings.slice(startIndex, 1 + endIndex);
            const valuesSlice = dataObj.data[variable].slice(startIndex, 1 + endIndex);

            // Loop through arrays and populate the table with data from sliced arrays
            const tableBody = document.getElementById('table-body');
            // delete all rows, if they exist
            while (tableBody.firstChild) {
                tableBody.removeChild(tableBody.firstChild);
            }
            // handle invalid dateString argument
            if (startIndex == -1) {
                const row = tableBody.insertRow();
                const cell = row.insertCell(0);
                cell.setAttribute("colspan", "25");
                cell.textContent = "Data only available for past 30 days: "
                    + minDateString + " to " + maxDateString;
            } else { // populate
                // Add times as the first row
                tableBody.appendChild(createRow(hourStringsSlice, 'hour'));
                // Add values as the second row
                tableBody.appendChild(createRow(valuesSlice, dataObj.units[variable]));
            }
            
        }
        updateTable();

        // DATE PICKER EVENT LISTENERS
        datePicker.addEventListener('change', function() {
            // console.log("change");
            updateTable();
        });
        datePicker.addEventListener('blur', function() {
            // console.log("blur");
            updateTable();
        });
        // back button
        document.getElementById('prevDay')
                .addEventListener('click', function() {
            datePicker.value = addToDateString(datePicker.value, -1);
            updateTable();
        });
        // forward button
        document.getElementById('nextDay')
                .addEventListener('click', function() {
            datePicker.value = addToDateString(datePicker.value, 1);
            updateTable();
        });

        // RESET TIME INPUTS
        /**
         * Reset datePicker, chartSlider, integerInput to defaults from assignment instructions.
         * (i.e.    Hourly Data: chart and table show last 24 hours,
         *          Desc Stats: calculated from last 7 days)
         * This function will also refresh chart, desc.stats, and table.
         */
        function resetTimeInputs() {
            datePicker.value = maxDateString; // most recent date
            updateTable();
            chartSlider.value = 1; // last 24 hours of data
            updateMyChart();
            integerInput.value = 7; // 7-day descriptive stats
            updateStats();
        };

        // VARIABLE SELECTORS
        document.getElementById('view1').addEventListener('click', function() {
            currentWeatherVariable = varStrings[0]; // 'temperature_2m'
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('view2').addEventListener('click', function() {
            currentWeatherVariable = varStrings[1]; // "precipitation"
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('view3').addEventListener('click', function() {
            currentWeatherVariable = varStrings[2]; // "wind_speed_10m"
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('other1').addEventListener('click', function() {
            currentWeatherVariable = varStrings[3]; // "relative_humidity_2m"
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('other2').addEventListener('click', function() {
            currentWeatherVariable = varStrings[4]; // "apparent_temperature"
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('other3').addEventListener('click', function() {
            currentWeatherVariable = varStrings[5]; // "cloud_cover"
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('other4').addEventListener('click', function() {
            currentWeatherVariable = varStrings[6]; // "wind_gusts_10m"
            resetTimeInputs(); // and refresh chart, stats, table
        });
        document.getElementById('other5').addEventListener('click', function() {
            currentWeatherVariable = varStrings[7]; // "direct_radiation"
            resetTimeInputs(); // and refresh chart, stats, table
        });
    } catch (error) {
        console.error(error);
    }
};

runScripts();
