/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface GameInterface extends utils.Interface {
  functions: {
    "authority()": FunctionFragment;
    "changeCost()": FunctionFragment;
    "changePixel(uint16,uint16,uint8)": FunctionFragment;
    "colors()": FunctionFragment;
    "height()": FunctionFragment;
    "state()": FunctionFragment;
    "width()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "authority"
      | "changeCost"
      | "changePixel"
      | "colors"
      | "height"
      | "state"
      | "width"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "authority", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "changeCost",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "changePixel",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "colors", values?: undefined): string;
  encodeFunctionData(functionFragment: "height", values?: undefined): string;
  encodeFunctionData(functionFragment: "state", values?: undefined): string;
  encodeFunctionData(functionFragment: "width", values?: undefined): string;

  decodeFunctionResult(functionFragment: "authority", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "changeCost", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changePixel",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "colors", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "height", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "state", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "width", data: BytesLike): Result;

  events: {
    "PixelChangedEvent(uint16,uint16,uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "PixelChangedEvent"): EventFragment;
}

export interface PixelChangedEventEventObject {
  row: number;
  column: number;
  color: number;
}
export type PixelChangedEventEvent = TypedEvent<
  [number, number, number],
  PixelChangedEventEventObject
>;

export type PixelChangedEventEventFilter =
  TypedEventFilter<PixelChangedEventEvent>;

export interface Game extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: GameInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    authority(overrides?: CallOverrides): Promise<[string]>;

    changeCost(overrides?: CallOverrides): Promise<[BigNumber]>;

    changePixel(
      row: PromiseOrValue<BigNumberish>,
      column: PromiseOrValue<BigNumberish>,
      newColor: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    colors(overrides?: CallOverrides): Promise<[string]>;

    height(overrides?: CallOverrides): Promise<[number]>;

    state(overrides?: CallOverrides): Promise<[BigNumber]>;

    width(overrides?: CallOverrides): Promise<[number]>;
  };

  authority(overrides?: CallOverrides): Promise<string>;

  changeCost(overrides?: CallOverrides): Promise<BigNumber>;

  changePixel(
    row: PromiseOrValue<BigNumberish>,
    column: PromiseOrValue<BigNumberish>,
    newColor: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  colors(overrides?: CallOverrides): Promise<string>;

  height(overrides?: CallOverrides): Promise<number>;

  state(overrides?: CallOverrides): Promise<BigNumber>;

  width(overrides?: CallOverrides): Promise<number>;

  callStatic: {
    authority(overrides?: CallOverrides): Promise<string>;

    changeCost(overrides?: CallOverrides): Promise<BigNumber>;

    changePixel(
      row: PromiseOrValue<BigNumberish>,
      column: PromiseOrValue<BigNumberish>,
      newColor: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    colors(overrides?: CallOverrides): Promise<string>;

    height(overrides?: CallOverrides): Promise<number>;

    state(overrides?: CallOverrides): Promise<BigNumber>;

    width(overrides?: CallOverrides): Promise<number>;
  };

  filters: {
    "PixelChangedEvent(uint16,uint16,uint8)"(
      row?: null,
      column?: null,
      color?: null
    ): PixelChangedEventEventFilter;
    PixelChangedEvent(
      row?: null,
      column?: null,
      color?: null
    ): PixelChangedEventEventFilter;
  };

  estimateGas: {
    authority(overrides?: CallOverrides): Promise<BigNumber>;

    changeCost(overrides?: CallOverrides): Promise<BigNumber>;

    changePixel(
      row: PromiseOrValue<BigNumberish>,
      column: PromiseOrValue<BigNumberish>,
      newColor: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    colors(overrides?: CallOverrides): Promise<BigNumber>;

    height(overrides?: CallOverrides): Promise<BigNumber>;

    state(overrides?: CallOverrides): Promise<BigNumber>;

    width(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    authority(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    changeCost(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    changePixel(
      row: PromiseOrValue<BigNumberish>,
      column: PromiseOrValue<BigNumberish>,
      newColor: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    colors(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    height(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    state(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    width(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
