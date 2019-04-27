import { Command, flags } from '@oclif/command';
import start from '../orchester';

class HelloCommand extends Command {
  async run() {
    const { flags: flagsCommand } = this.parse(HelloCommand);
    const name = flagsCommand.name || 'world';
    this.log(`hello ${name} from ./src/commands/orchester.js`);

    const BOARD_SIZE = {x: 10, y: 10}
    const RARENESS = 0.5; // 0 - 1
    const WAVE_STRENGTH = 0.5 // 0 - 1
    const edges = [];
    const vertices = [];
    const findEdge = (X, Y) => edges.find(({ x, y }) => x === X && y === Y);
    const getEdgeOrCreate = (X, Y) => {
      const edge = findEdge(X, Y);
      if (edge) {
        return edge;
      }
      const newEdge = { x: X, y: Y };
      edges.push(newEdge);
      return newEdge;
    };
    const isInBoundary = ({ x, y }) => x > 0 && x < BOARD_SIZE.x && y > 0 && y < BOARD_SIZE.y;

    // Create a board
    console.log("Start creating a board")
    for (let X = 1; X < 9; X += 1) {
      for (let Y = 1; Y < 9; Y += 1) {
        const centerEdge = getEdgeOrCreate(X, X);
        const upEdge = getEdgeOrCreate(X, Y - 1);
        const downEdge = getEdgeOrCreate(X, Y + 1);
        const leftEdge = getEdgeOrCreate(X - 1, Y);
        const rightEdge = getEdgeOrCreate(X + 1, Y);

        if (isInBoundary(upEdge)) {
          vertices.push({ from: centerEdge, to: upEdge });
        }
        if (isInBoundary(downEdge)) {
          vertices.push({ from: centerEdge, to: downEdge });
        }
        if (isInBoundary(leftEdge)) {
          vertices.push({ from: centerEdge, to: leftEdge });
        }
        if (isInBoundary(rightEdge)) {
          vertices.push({ from: centerEdge, to: rightEdge });
        }
      }
    }
    console.log("End creating a board")
    console.log(`edges.length = ${edges.length}`)
    console.log(`verticles.length = ${vertices.length}`)

    // Wave
    console.log("Start waving")
    for (const edge of edges) {
      edge.x = (Math.random() - 0.5) * WAVE_STRENGTH;
      edge.y = (Math.random() - 0.5) * WAVE_STRENGTH;
    }
    console.log("End waving")
    // Remove random edge
    console.log("Start removing random edges")
    const countEdgesToRemove = Math.floor(edges.length * RARENESS)
    console.log(`countEdgesToRemove = ${countEdgesToRemove}`)

    for (let i = 0; i < countEdgesToRemove; i += 1) {
      const edgeToRemove = edges[Math.floor(Math.random() * edges.length)];
      console.log({edgeToRemove})
      console.log(`Removing edge ${edgeToRemove.x} X ${edgeToRemove.y}`)
      for (const vertice of vertices) {
        if (vertice.to === edgeToRemove || vertice.from === edgeToRemove) {
          vertices.splice(vertices.indexOf(vertice), 1)
        }
      }
      edges.splice(edges.indexOf(edgeToRemove), 1)
    }
    console.log(`edges.length = ${edges.length}`)
    console.log(`verticles.length = ${vertices.length}`)
    for (const edge of edges) {
      console.log(`${edge.x} X ${edge.y}`);
    }
    for (const vertice of vertices) {
      console.log(`${vertice.from.x} X ${vertice.from.y} => ${vertice.to.x} X ${vertice.to.y}`);
    }

    // await start();
  }
}

HelloCommand.description = `Describe the command here
...
Extra documentation goes here
`;

HelloCommand.flags = {
  name: flags.string({ char: 'n', description: 'name to print' }),
};

export default HelloCommand;
