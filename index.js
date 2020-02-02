const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    color: '#1D8C85',
    headType: 'bendr',
    tailType: 'fat-rattle'
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  const width = request.body.board.width; 
  const height = request.body.board.height;
  // NOTE: Do something here to generate your move
  const board = Array(request.body.board.height).fill().map(() =>Array(request.body.board.width).fill(0));
  const snakes = request.body.board.snakes;

  for (const snake of snakes) {
    const body = snake.body;

    for (const coord of body) {
      board[coord.y][coord.x] = -1;
    }
  }

  const food = request.body.board.food;

  for (const coord of food) {
    board[coord.y][coord.x] = 1;
  }

  const head = request.body.you.body[0];
  board[head.y][head.x] = "H";

  const x = head.x;
  const y = head.y;

  const avaliablespots = [{ x: x + 1, y: y}, { x: x - 1, y: y}, { x: x, y: y + 1}, {x: x, y: y - 1}];
  const goodspots = [];
  for (const coord of avaliablespots) {
    if (coord.x >= 0 && coord.x < width) {
      if (coord.y >= 0 && coord.y < height) {
        if (board[coord.y][coord.x]!= -1){
          goodspots.push(coord);
        }
      }
    }
  }
 let closestfood = null;
 let closestfooddistance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));

 for (const coord of food) {
   const distance =  Math.sqrt(Math.pow(coord.x - head.x, 2) + Math.pow(coord.y - head.y, 2));

   if(distance <= closestfooddistance) {
     closestfooddistance = distance;
     closestfood = coord;
   }
 }

 let closestgoodspot = null;
 let closestgoodspotdistance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));

 if (closestfood) {
  for(const goodspot of goodspots) {
   const distance =  Math.sqrt(Math.pow(closestfood.x - goodspot.x, 2) + Math.pow(closestfood.y - goodspot.y, 2));
   if (distance <= closestgoodspotdistance){
     closestgoodspotdistance = distance;
     closestgoodspot = goodspot;
   } 
  }
 }

  const directions = {
    'up': [0, -1],
    'down': [0, 1],
    'right': [1, 0],
    'left': [-1, 0]
  };
  let neighbor = null;
  if (closestgoodspot) {
    neighbor = closestgoodspot;
  } else {
    neighbor = goodspots[Math.floor(Math.random() * goodspots.length)];
  }
  const move = [neighbor.x - head.x, neighbor.y - head.y];
  const direction = Object.keys(directions).find(d => {
    return (directions[d][0] === move[0] && directions[d][1] === move[1]);
  });

  console.log(direction);

  // Response data
  const data = {
    move: direction, // one of: ['up','down','left','right']
  }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})


function print_board(board) {
  for (const y in board) {
    for (const coord of board[y]) {
      process.stdout.write(`${coord},`);
    }
    console.log();
  }
}