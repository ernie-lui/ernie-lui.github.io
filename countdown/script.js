function loadClock() {
    const futureDate = dayjs('2025-01-01');

    const days = futureDate.diff(dayjs(), 'day');
    // console.log(days);

    let remainingTime = futureDate.subtract(days, 'day');
    const hours = remainingTime.diff(dayjs(), 'hours');
    // console.log(hours);

    remainingTime = remainingTime.subtract(hours, 'hour');
    const minutes = remainingTime.diff(dayjs(), 'minute');
    // console.log(minutes);

    remainingTime = remainingTime.subtract(minutes, 'minute');
    const seconds = remainingTime.diff(dayjs(), 'second');
    // console.log(String(days).padStart(1, '0'));

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    daysElement.textContent = String(days).padStart(2, '0');
    hoursElement.textContent = String(hours).padStart(2, '0');
    minutesElement.textContent = String(minutes).padStart(2, '0');
    secondsElement.textContent = String(seconds).padStart(2, '0');
}

setInterval(loadClock, 1000);



