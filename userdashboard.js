        let nav = 0;
        let clicked = null;
        let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
        
        const API_URL = 'http://localhost:3000/api'; // Change this to your deployed API URL

        const calendar = document.getElementById('calendar');
        const newEventModal = document.getElementById('newEventModal');
        const deleteEventModal = document.getElementById('deleteEventModal');
        const backDrop = document.getElementById('modalBackDrop');
        const eventTitleInput = document.getElementById('eventTitleInput');
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Fetch events from database
        async function fetchEvents() {
            try {
                const response = await fetch(`${API_URL}/events`);
                if (!response.ok) throw new Error('Failed to fetch events');
                events = await response.json();
                load();
            } catch (error) {
                console.error('Error fetching events:', error);
                alert('Failed to load events from database');
            }
        }

        // Pre-populate with some events for demonstration
        if (events.length === 0) {
            events = [
                { date: '12/8/2024', title: 'Dog Grooming' },
                { date: '12/15/2024', title: 'Vet Appointment' },
                { date: '12/20/2024', title: 'Pet Sitting' },
                { date: '12/22/2024', title: 'Cat Grooming' },
                { date: '12/22/2024', title: 'Pet Boarding' },
                { date: '12/28/2024', title: 'Vaccination' }
            ];
            localStorage.setItem('events', JSON.stringify(events));
        }

        function openModal(date) {
            clicked = date;

            const eventForDay = events.find(e => e.date === clicked);

            if (eventForDay) {
                document.getElementById('eventText').innerText = eventForDay.title;
                deleteEventModal.style.display = 'block';
            } else {
                newEventModal.style.display = 'block';
            }

            backDrop.style.display = 'block';
        }

        function load() {
            const dt = new Date();

            if (nav !== 0) {
                dt.setMonth(new Date().getMonth() + nav);
            }

            const day = dt.getDate();
            const month = dt.getMonth();
            const year = dt.getFullYear();

            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
                weekday: 'long',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            });
            const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

            document.getElementById('monthDisplay').innerText = 
                `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

            calendar.innerHTML = '';

            for(let i = 1; i <= paddingDays + daysInMonth; i++) {
                const daySquare = document.createElement('div');
                daySquare.classList.add('day');

                const dayString = `${month + 1}/${i - paddingDays}/${year}`;

                if (i > paddingDays) {
                    daySquare.innerText = i - paddingDays;
                    const eventForDay = events.find(e => e.date === dayString);

                    if (i - paddingDays === day && nav === 0) {
                        daySquare.id = 'currentDay';
                    }

                    if (eventForDay) {
                        const eventDiv = document.createElement('div');
                        eventDiv.classList.add('event');
                        eventDiv.innerText = eventForDay.title;
                        daySquare.appendChild(eventDiv);
                    }

                    daySquare.addEventListener('click', () => openModal(dayString));
                } else {
                    daySquare.classList.add('padding');
                }

                calendar.appendChild(daySquare);    
            }
        }

        function closeModal() {
            eventTitleInput.classList.remove('error');
            newEventModal.style.display = 'none';
            deleteEventModal.style.display = 'none';
            backDrop.style.display = 'none';
            eventTitleInput.value = '';
            clicked = null;
            load();
        }

        function saveEvent() {
            if (eventTitleInput.value) {
                eventTitleInput.classList.remove('error');

                events.push({
                    date: clicked,
                    title: eventTitleInput.value,
                });

                localStorage.setItem('events', JSON.stringify(events));
                closeModal();
            } else {
                eventTitleInput.classList.add('error');
            }
        }

        function deleteEvent() {
            events = events.filter(e => e.date !== clicked);
            localStorage.setItem('events', JSON.stringify(events));
            closeModal();
        }

        function initButtons() {
            document.getElementById('nextButton').addEventListener('click', () => {
                nav++;
                load();
            });

            document.getElementById('backButton').addEventListener('click', () => {
                nav--;
                load();
            });

            document.getElementById('saveButton').addEventListener('click', saveEvent);
            document.getElementById('cancelButton').addEventListener('click', closeModal);
            document.getElementById('deleteButton').addEventListener('click', deleteEvent);
            document.getElementById('closeButton').addEventListener('click', closeModal);

            // Quick action buttons
            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.textContent.trim();
                    if (action.includes('Emergency')) {
                        alert('Connecting you to emergency vet services...');
                    } else {
                        alert(`Opening ${action} booking form...`);
                    }
                });
            });
        }

        initButtons();
        fetchEvents(); // Load events from database on initialization;