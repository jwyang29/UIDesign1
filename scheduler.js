document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('user-form');
    const schedulerContainer = document.getElementById('scheduler-container');
    const landingPage = document.querySelector('.landing-page');
    const resultContainer = document.getElementById('result-container');
    const saveButton = document.getElementById('save-button');
    const colorInput = document.getElementById('color');
    const colorDisplay = document.getElementById('color-display');
    const groupSizeSelect = document.getElementById('group-size');
    const groupMeetingTimesList = document.getElementById('group-meeting-times');
    const groupSizeLabel = document.getElementById('group-size-label');

    let currentUsername = '';
    let currentUserColor = '';
    let allUsersData = [];
    let groupSize = 0;
    let currentMemberCount = 0;

    colorInput.addEventListener('input', function() {
        colorDisplay.style.backgroundColor = colorInput.value;
    });

    userForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (currentMemberCount === 0) {
            groupSize = parseInt(groupSizeSelect.value, 10);
            groupSizeSelect.style.display = 'none';
            groupSizeLabel.style.display = 'none';
        }
        currentUsername = document.getElementById('username').value;
        currentUserColor = document.getElementById('color').value;
        initializeScheduler(currentUsername, currentUserColor);
        landingPage.style.display = 'none';
        schedulerContainer.style.display = 'block';
    });

    saveButton.addEventListener('click', function() {
        saveUserTimes();
    });

    function initializeScheduler(username, userColor) {
        const monthElement = document.querySelector('.month');
        const daysContainer = document.getElementById('days-container');
        const timesContainer = document.getElementById('times-container');
        const selectedTimesContainer = document.getElementById('selected-times-container');
        const selectedTimesList = document.getElementById('selected-times-list');

        let currentDate = new Date();
        let currentWeekStart = getFirstDayOfWeek(currentDate);
        let selectedTimes = [];

        function getFirstDayOfWeek(date) {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            return new Date(date.setDate(diff));
        }

        function updateCalendar() {
            const month = new Date(currentWeekStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            monthElement.textContent = month;

            daysContainer.innerHTML = '';
            timesContainer.innerHTML = '';

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(currentWeekStart);
                dayDate.setDate(dayDate.getDate() + i);

                const dayElement = document.createElement('div');
                dayElement.className = 'day';

                const circleElement = document.createElement('div');
                circleElement.className = 'circle';
                circleElement.textContent = dayDate.getDate();

                const dayNameElement = document.createElement('div');
                dayNameElement.className = 'day-name';
                dayNameElement.textContent = dayDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

                dayElement.appendChild(circleElement);
                dayElement.appendChild(dayNameElement);

                daysContainer.appendChild(dayElement);

                const dayColumn = document.createElement('div');
                dayColumn.className = 'day-column';

                const timeSlots = document.createElement('div');
                timeSlots.className = 'time-slots';

                for (let hour = 8; hour <= 22; hour++) {
                    createTimeSlot(dayDate, hour, 0, timeSlots);
                    createTimeSlot(dayDate, hour, 30, timeSlots);
                }

                dayColumn.appendChild(timeSlots);
                timesContainer.appendChild(dayColumn);
            }
        }

        function createTimeSlot(dayDate, hour, minutes, timeSlots) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            const dateTime = new Date(dayDate);
            dateTime.setHours(hour, minutes);
            timeSlot.dataset.dateTime = dateTime.toISOString();

            const timeElement = document.createElement('div');
            timeElement.className = 'time';
            timeElement.textContent = `${hour}:${minutes === 0 ? '00' : minutes}`;

            timeSlot.appendChild(timeElement);
            timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot));
            timeSlots.appendChild(timeSlot);
        }

        function selectTimeSlot(timeSlot) {
            const dateTime = timeSlot.dataset.dateTime;
            if (selectedTimes.includes(dateTime)) {
                selectedTimes = selectedTimes.filter(time => time !== dateTime);
                timeSlot.classList.remove('selected');
            } else {
                selectedTimes.push(dateTime);
                timeSlot.classList.add('selected');
                timeSlot.style.borderColor = userColor;
                timeSlot.style.setProperty('--selected-color', userColor);
            }
            updateSelectedTimes();
            extendSelections();
        }

        function updateSelectedTimes() {
            selectedTimesList.innerHTML = '';
            selectedTimes.sort().forEach(time => {
                const listItem = document.createElement('li');
                const dateTime = new Date(time);
                listItem.textContent = dateTime.toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                listItem.style.color = currentUserColor;
                selectedTimesList.appendChild(listItem);
            });
        }

        function extendSelections() {
            const allTimeSlots = document.querySelectorAll('.time-slot');
            allTimeSlots.forEach(slot => {
                slot.classList.remove('start', 'middle', 'end', 'single');
                slot.style.borderColor = '';
            });

            selectedTimes.sort().forEach((time, index, arr) => {
                const currentSlot = document.querySelector(`[data-date-time='${time}']`);
                const prevTime = arr[index - 1];
                const nextTime = arr[index + 1];
                const currentDateTime = new Date(time);
                const prevDateTime = prevTime ? new Date(prevTime) : null;
                const nextDateTime = nextTime ? new Date(nextTime) : null;

                currentSlot.style.borderColor = currentUserColor;

                if (prevDateTime && nextDateTime && isAdjacent(prevDateTime, currentDateTime) && isAdjacent(currentDateTime, nextDateTime)) {
                    currentSlot.classList.add('middle');
                } else if (prevDateTime && isAdjacent(prevDateTime, currentDateTime)) {
                    currentSlot.classList.add('end');
                } else if (nextDateTime && isAdjacent(currentDateTime, nextDateTime)) {
                    currentSlot.classList.add('start');
                } else {
                    currentSlot.classList.add('single');
                }
            });
        }

        function isAdjacent(prevDateTime, currentDateTime) {
            return (currentDateTime - prevDateTime) === 30 * 60 * 1000; // 30 minutes in milliseconds
        }

        function changeWeek(weeks) {
            currentWeekStart.setDate(currentWeekStart.getDate() + weeks * 7);
            updateCalendar();
        }

        document.getElementById('prev-week').addEventListener('click', function() {
            changeWeek(-1);
        });

        document.getElementById('next-week').addEventListener('click', function() {
            changeWeek(1);
        });

        updateCalendar();
    }

    function saveUserTimes() {
        const selectedTimeSlots = Array.from(document.querySelectorAll('.time-slot.selected')).map(slot => slot.dataset.dateTime);
        const data = {
            username: currentUsername,
            color: currentUserColor,
            times: selectedTimeSlots
        };
        allUsersData.push(data);
        console.log('User Times Saved:', data);
        alert('Your times have been saved!');
        currentMemberCount++;
        if (currentMemberCount < groupSize) {
            resetForNextUser();
        } else {
            showGroupMeetingTimes();
        }
    }

    function resetForNextUser() {
        currentUsername = '';
        currentUserColor = '';
        document.getElementById('username').value = '';
        document.getElementById('color').value = '#000000';
        colorDisplay.style.backgroundColor = '#000000';
        landingPage.style.display = 'flex';
        schedulerContainer.style.display = 'none';
    }

    function showGroupMeetingTimes() {
        schedulerContainer.style.display = 'none';
        resultContainer.style.display = 'flex';

        const allSelectedTimes = allUsersData.map(user => user.times).flat();
        const timeCounts = {};

        allSelectedTimes.forEach(time => {
            if (!timeCounts[time]) {
                timeCounts[time] = [];
            }
            const user = allUsersData.find(user => user.times.includes(time));
            if (user) {
                timeCounts[time].push(user);
            }
        });

        console.log('Time Counts:', timeCounts); // Debugging output

        resultContainer.innerHTML = '<h1>Group Meeting Times</h1><div id="bar-graph-container"></div>';
        const barGraphContainer = document.getElementById('bar-graph-container');

        // Convert object keys to sorted array and merge consecutive times
        const sortedTimes = Object.keys(timeCounts).sort();
        let mergedTimes = [];
        let currentRange = [];

        sortedTimes.forEach((time, index) => {
            const currentTime = new Date(time);
            if (currentRange.length === 0) {
                currentRange.push(currentTime);
            } else {
                const previousTime = currentRange[currentRange.length - 1];
                if ((currentTime - previousTime) === 30 * 60 * 1000) { // Consecutive time
                    currentRange.push(currentTime);
                } else {
                    mergedTimes.push(currentRange);
                    currentRange = [currentTime];
                }
            }
            if (index === sortedTimes.length - 1) {
                mergedTimes.push(currentRange);
            }
        });

        // Display merged times as bar graph
        mergedTimes.forEach(range => {
            const startTime = range[0];
            const endTime = range[range.length - 1];
            const startString = startTime.toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const endString = endTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });

            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';
            const barLabel = document.createElement('div');
            barLabel.className = 'bar-label';
            barLabel.textContent = startTime.getTime() === endTime.getTime() ? startString : `${startString} - ${endString}`;
            barContainer.appendChild(barLabel);

            const bar = document.createElement('div');
            bar.className = 'bar';
            range.forEach(time => {
                const timeStr = time.toISOString();
                timeCounts[timeStr].forEach(user => {
                    const barUnit = document.createElement('div');
                    barUnit.className = 'bar-unit';
                    barUnit.style.backgroundColor = user.color;
                    barUnit.title = user.username;
                    bar.appendChild(barUnit);
                });
            });

            barContainer.appendChild(bar);
            barGraphContainer.appendChild(barContainer);
        });

        if (Object.keys(timeCounts).length === 0) {
            const noTimesMessage = document.createElement('div');
            noTimesMessage.textContent = 'No common available times found.';
            barGraphContainer.appendChild(noTimesMessage);
        }
    }
});

















