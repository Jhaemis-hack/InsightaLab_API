import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

class SocketServer {
  private io: Server | null = null;
  private initialized = false;

  /**
   * Initialize Socket.IO using a PORT
   * Call ONCE from entry file
   */
  async init(server: HttpServer) {
    if (this.initialized) {
      return this.io;
    }

    this.io = new Server(server, {
      path: "/api/socket/io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.registerCoreEvents();

    this.initialized = true;
    console.log("Socket.IO server initialized");

    return this.io;
  }

  /**
   * Core listeners
   */
  private registerCoreEvents() {
    if (!this.io) return;

    this.io.use((socket, next) => {
      // const token = socket.handshake.auth.token;

      const err: any = new Error("not authorized");
      err.data = { content: "Please retry later" };
      next(err);
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  /**
   * Safe accessor
   */
  get instance(): Server {
    if (!this.io) {
      throw new Error("Socket.IO server not initialized");
    }
    return this.io;
  }

  /**
   * Helper emitters
   */
  emit(event: string, payload: any) {
    this.instance.emit(event, payload);
  }

  emitTo(room: string, event: string, payload: any) {
    this.instance.to(room).emit(event, payload);
  }

  disconect() {
    if (!this.initialized) {
      return;
    }

    this.io?.close();
    this.initialized = false;
    console.log(`Socket.IO connection ended`);
  }
}

/**
 * SINGLETON EXPORT
 */
const IoServer = new SocketServer();
export default IoServer;
