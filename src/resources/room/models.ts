import {
  isDefined,
  isNumber,
  isParsableToArray,
  isValidRoomType,
} from "../../core/checker";
import { RoomType } from "../../core/constants";

export class RoomBaseModel {
  constructor(
    public roomNumber: number,
    public roomType: RoomType,
    public floor: string,
    public isOccupied: boolean,
    public isClean: boolean,
    public isOutOfOrder: boolean,
    public problems: string[]
  ) {}

  public static fromJson(jsonRoom: any): RoomBaseModel {
    isDefined(jsonRoom.roomNumber, "roomNumber");
    isNumber(jsonRoom.roomNumber, "roomNumber");
    isDefined(jsonRoom.roomType, "roomType");
    isValidRoomType(jsonRoom.roomType, "roomType");
    isDefined(jsonRoom.floor, "floor");

    return new RoomBaseModel(
      Number(jsonRoom.roomNumber),
      jsonRoom.roomType,
      jsonRoom.floor,
      false,
      true,
      false,
      []
    );
  }
}

export class RoomReadModel extends RoomBaseModel {
  constructor(
    public id: number,
    public roomNumber: number,
    public roomType: RoomType,
    public floor: string,
    public isOccupied: boolean,
    public isClean: boolean,
    public isOutOfOrder: boolean,
    public problems: string[]
  ) {
    super(
      roomNumber,
      roomType,
      floor,
      isOccupied,
      isClean,
      isOutOfOrder,
      problems
    );
  }

  public static fromJson(jsonRoom: any): RoomReadModel {
    isDefined(jsonRoom.roomNumber, "roomNumber");
    isNumber(jsonRoom.roomNumber, "roomNumber");
    isDefined(jsonRoom.roomType, "roomType");
    isValidRoomType(jsonRoom.roomType, "roomType");
    isDefined(jsonRoom.floor, "floor");
    isDefined(jsonRoom.isOccupied, "isOccupied");
    isDefined(jsonRoom.isClean, "isClean");
    isDefined(jsonRoom.isOutOfOrder, "isOutOfOrder");
    isDefined(jsonRoom.problems, "problems");
    isParsableToArray(jsonRoom.problems, "problems");

    return new RoomReadModel(
      Number(jsonRoom.id),
      Number(jsonRoom.roomNumber),
      jsonRoom.roomType,
      jsonRoom.floor,
      Boolean(jsonRoom.isOccupied),
      Boolean(jsonRoom.isClean),
      Boolean(jsonRoom.isOutOfOrder),
      JSON.parse(jsonRoom.problems)
    );
  }
}
export interface SingleRoomResponseModel {
  success: true;
  room: RoomReadModel;
  more: any;
}
export interface ManyRoomsResponseModel {
  success: true;
  rooms: RoomReadModel[];
  more: any;
}
