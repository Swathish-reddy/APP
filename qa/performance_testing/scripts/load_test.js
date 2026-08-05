import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp-up
        { duration: '1m', target: 50 },  // Peak load
        { duration: '30s', target: 0 },  // Ramp-down
    ],
};

export default function () {
    let res = http.get('http://localhost:8000/api/v1/patients/');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
}
