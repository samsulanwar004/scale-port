import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

let PORT = 8888

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const usbport = new SerialPort({ path: 'COM6', baudRate: 9600 })
const parser = usbport.pipe(new ReadlineParser({ delimiter: '\r\n' }))

io.on("connection", (socket) => {

    let matchCount = 0
    let match = 0
    let zero = 0
    parser.on('data', function (data) {
        const scaleNetto = data.split('ww')[1].split('kg')[0]
        let weight = parseFloat(scaleNetto)

        if (weight > 0) {
        
            if (match === weight) {
                matchCount++
            }

            match = weight

            if (matchCount === 20) {
                socket.emit('scale', weight)
            }

            zero = 0
        } else {
            if (zero === 0) {
                socket.emit('scale', 0)
            }
            
            matchCount = 0
            match = 0
            zero++
        }
    })
});

httpServer.listen(PORT, function() {
    console.log('Server is running on PORT:', PORT)
});


