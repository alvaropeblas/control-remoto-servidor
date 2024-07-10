const express = require('express');
const { exec } = require('child_process');
const si = require('systeminformation');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const wakeonlan = require('wakeonlan');
const corsOptions = {
    origin: 'http://localhost:19000', // Reemplaza con el origen de tu aplicación React Native
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

const nircmdPath = 'C:\\nircmd\\nircmd.exe';

app.post('/', (req, res) => {
    const { command, x, y } = req.body;

    switch (command) {
        case 'volume_up':
            exec(`${nircmdPath} changesysvolume 2000`, (error) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
            });
            break;
        case 'volume_down':
            exec(`${nircmdPath} changesysvolume -2000`, (error) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
            });
            break;
        case 'play_pause':
            exec(`${nircmdPath} sendkeypress media_play_pause`, (error) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
            });
            break;
        case 'move_mouse':
            exec(`${nircmdPath} movecursor ${x} ${y}`, (error) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
            });
            break;
        case 'click_mouse':
            exec(`${nircmdPath} sendmouse left click`, (error) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
            });
            break;
        default:
            console.log('Comando no reconocido');
    }

    res.send('Comando recibido');
});

app.get('/system-info', (req, res) => {
    const command = 'wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature';

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error al ejecutar el comando:', error);
            res.status(500).json({ error: 'Error al obtener la temperatura' });
            return;
        }

        if (!stdout || typeof stdout !== 'string') {
            console.error('Error: La salida del comando no es válida');
            res.status(500).json({ error: 'No se pudo obtener la temperatura' });
            return;
        }

        const temperatureMatch = stdout.match(/\d+/);
        if (!temperatureMatch) {
            console.error('Error: No se pudo extraer la temperatura de la salida del comando');
            res.status(500).json({ error: 'No se pudo obtener la temperatura' });
            return;
        }

        const temperatureRaw = parseInt(temperatureMatch[0]);
        const celsiusTemp = (temperatureRaw / 10) - 273.15;

        res.json({ temperature: celsiusTemp });
    });
});

app.get('/cpu-load', (req, res) => {
    si.currentLoad()
        .then(data => {
            res.json({ load: data.currentLoad });
        })
        .catch(error => {
            console.error('Error al obtener la carga de la CPU:', error);
            res.status(500).json({ error: 'Error al obtener la carga de la CPU' });
        });
});

app.get('/memory-info', (req, res) => {
    si.mem()
        .then(data => {
            res.json({
                total: data.total,
                free: data.free,
                used: data.used,
                active: data.active,
                available: data.available,
            });
        })
        .catch(error => {
            console.error('Error al obtener la información de la memoria:', error);
            res.status(500).json({ error: 'Error al obtener la información de la memoria' });
        });
});

app.get('/disk-info', (req, res) => {
    si.fsSize()
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error('Error al obtener la información del disco:', error);
            res.status(500).json({ error: 'Error al obtener la información del disco' });
        });
});

app.post('/turn-off', (req, res) => {
    exec('shutdown /s /t 0', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al apagar el ordenador: ${error.message}`);
            res.status(500).json({ error: 'Error al apagar el ordenador' });
            return;
        }
        console.log('Ordenador apagado correctamente');
        res.send('Ordenador apagado');
    });
});

app.post('/restart', (req, res) => {
    exec('shutdown /r /t 0', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al apagar el ordenador: ${error.message}`);
            res.status(500).json({ error: 'Error al apagar el ordenador' });
            return;
        }
        console.log('Ordenador apagado correctamente');
        res.send('Ordenador apagado');
    });
});

app.post('/suspend', (req, res) => {
    exec('rundll32.exe powrprof.dll,SetSuspendState', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al suspender el ordenador: ${error.message}`);
            res.status(500).json({ error: 'Error al suspender el ordenador' });
            return;
        }
        console.log('Ordenador suspendido correctamente');
        res.send('Ordenador suspendido');
    });
});


app.post('/turn-on', (req, res) => {
    const macAddress = 'B4B52FC6E008';
    wakeonlan(macAddress, (error) => {
        if (error) {
            console.error(`Error al encender el ordenador: ${error.message}`);
            res.status(500).json({ error: 'Error al encender el ordenador' });
            return;
        }
        console.log('Ordenador encendido correctamente');
        res.send('Ordenador encendido');
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
