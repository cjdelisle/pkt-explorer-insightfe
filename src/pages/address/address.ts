import { Component, Injectable } from '@angular/core';
import { Events, IonicPage, NavParams } from 'ionic-angular';
import { AddressProvider } from '../../providers/address/address';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { PriceProvider } from '../../providers/price/price';
import { TxsProvider } from '../../providers/transactions/transactions';

@Injectable()
@IonicPage({
  name: 'address',
  segment: ':chain/:network/address/:addrStr',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-address',
  templateUrl: 'address.html'
})
export class AddressPage {
  public loading = true;
  public address: any = {};
  public nroTransactions = 0;
  public errorMessage: string;
  public chainNetwork: ChainNetwork;

  private addrStr: string;

  constructor(
    public navParams: NavParams,
    public currencyProvider: CurrencyProvider,
    public txProvider: TxsProvider,
    private apiProvider: ApiProvider,
    private priceProvider: PriceProvider,
    private addrProvider: AddressProvider,
    private events: Events
  ) {
    this.addrStr = navParams.get('addrStr');

    const chain: string = navParams.get('chain');
    const network: string = navParams.get('network');

    this.chainNetwork = {
      chain,
      network
    };
    this.apiProvider.changeNetwork(this.chainNetwork);
    this.currencyProvider.setCurrency(this.chainNetwork);
    this.priceProvider.setCurrency();

    if (
      this.chainNetwork.chain === 'BTC' ||
      this.chainNetwork.chain === 'BCH' ||
      this.chainNetwork.chain === 'PKT'
    ) {
      this.events.subscribe('TransactionList', (d: any) => {
        this.nroTransactions = d.length;
      });
    }
  }

  public ionViewWillLoad(): void {
    this.addrProvider
      .getAddressBalance(this.addrStr, this.chainNetwork)
      .subscribe(
        data => {
          this.address = {
            balance: data.balance || 0,
            confirmed: data.balance || 0,
            unconfirmed: data.unconfirmedReceived,
            addrStr: this.addrStr,
            mined24: data.mined24
          };
          this.loading = false;
        },
        err => {
          this.errorMessage = err;
          this.loading = false;
        }
      );
  }

  public getConvertedNumber(n: number|string): number {
    return this.currencyProvider.getConvertedNumber(n, this.chainNetwork.chain);
  }
}
