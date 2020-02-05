const fs = require('fs');
const http = require('http');


const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err){
        reject(err);
      }
      else {
        resolve(data.toString());
      }
    });
  });
};


const writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err, response) => {
      if (err){
        reject(err);
      }
      else {
        resolve(response);
      }
    });
  });
};


const addGuest = (guest) => {
  return readFile('./guests.json')
    .then(data => {
      const guests = JSON.parse(data);
      let max = guests.reduce((acc, guest) => {
        if (guest.id > acc){
          acc = guest.id;
        }
        return acc;
      }, 0);
      guest.id = max + 1;
      guests.push(guest);
      return writeFile('./guests.json', JSON.stringify(guests, null, 2));
    })
    .then(() => {
      return guest;
    });
};


const server = http.createServer((req, res) => {
  if (req.url === '/') {
    if (req.method === 'GET') {
      readFile('./index.html')
        .then(data => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(data);
          res.end();
        })
        .catch(ex => res.write(ex.toString()))
    }
  }
  else if (req.url === '/api/guests') {
    if (req.method === 'GET') {
      readFile('./guests.json')
        .then(data => {
          res.writeHead(200, { 'Content-Type': 'text/json' });
          res.write(data);
          res.end();
        })
        .catch(ex => res.write(ex.toString()))
    }
    else if (req.method === 'POST') {
      let buffer = '';
      req.on('data', (chunk) => {
        buffer += chunk;
        console.log(chunk.toString())
      })
      req.on('end', () => {
        const guest = JSON.parse(buffer);
        addGuest(guest)
          .then(data => {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(data));
            res.end();
          })
      })
    }
  }
  else {
    res.end('Not a valid request, check your url structure');
  }
});

server.listen( 3000, () => console.log('listening on port 3000'));
