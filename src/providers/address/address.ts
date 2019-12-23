import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { BlocksProvider } from '../blocks/blocks';
import { ApiCoin, ApiEthCoin, TxsProvider } from '../transactions/transactions';

export interface ApiAddr {
  unconfirmedReceived: string,
  confirmedReceived: string,
  balance: string,
  spent: string,
  burned: string,
  recvCount: number,
  spentCount: number,
}

export interface ApiRichRow {
  address: string,
  balance: string,
  unconfirmed: string,
  received: string,
  spent: string
}
export interface ApiRich {
  results: ApiRichRow[],
  prev: string,
  next: string,
}

@Injectable()
export class AddressProvider {
  constructor(
    public httpClient: HttpClient,
    public currency: CurrencyProvider,
    public blocks: BlocksProvider,
    public txsProvider: TxsProvider,
    private apiProvider: ApiProvider
  ) {}

  public getAddressBalance(
    addrStr?: string,
    chainNetwork?: ChainNetwork
  ): Observable<ApiAddr> {
    return this.httpClient.get<ApiAddr>(
      `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}/balance`
    );
  }

  public getAddressActivity(
    addrStr?: string,
    chainNetwork?: ChainNetwork
  ): Observable<ApiCoin[] & ApiEthCoin[]> {
    return this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
      `${this.apiProvider.getUrl(
        chainNetwork
      )}/address/${addrStr}/txs?limit=1000`
    );
  }

  public getAddressActivityCoins(
    addrStr?: string,
    chainNetwork?: ChainNetwork
  ): Observable<any> {
    return this.httpClient.get<any>(
      `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}/coins`
    );
  }

  public getRichList(
      chainNetwork?: ChainNetwork
  ): Observable<ApiRich> {
    return this.httpClient.get<ApiRich>(
      `${this.apiProvider.getUrl(chainNetwork)}/stats/richlist`
    );
  }
}
