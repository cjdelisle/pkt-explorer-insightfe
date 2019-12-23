import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';

export interface ApiBlock {
  height: number;
  nonce: number;
  size: number;
  confirmations: number;
  hash: string;
  nextBlockHash: string;
  previousBlockHash: string;
  transactionCount: number;
  reward: number;
  minedBy: string;
  time: Date;
  timeNormalized: Date;
}

export interface ApiUtxoCoinBlock extends ApiBlock {
  difficulty: number;
  merkleRoot: string;
  bits: number;
  version: number;
}

export interface ApiEthBlock extends ApiBlock {
  difficulty: number;
  totalDifficulty: number;
  gasUsed: number;
  gasLimit: number;
}
export interface AppBlock {
  height: number;
  nonce: number;
  size: number;
  confirmations: number;
  virtualSize: number;
  hash: string;
  time: number;
  tx: {
    length: number;
  };
  txlength: number;
  previousblockhash: string;
  nextblockhash: string;
  poolInfo: {
    poolName: string;
    url: string;
  };
  reward: number;
}

export interface AppUtxoCoinBlock extends AppBlock {
  difficulty: number;
  merkleroot: string;
  bits: string;
  version: number;
}

export interface AppPktBlock extends AppUtxoCoinBlock {
  pkt: {
    annCount: number;
    annWork: number;
    totalWork: number;
  };
}

export interface AppEthBlock extends AppBlock {
  difficulty: number;
  totalDifficulty: number;
  gasUsed: number;
  gasLimit: number;
}

@Injectable()
export class BlocksProvider {
  constructor(
    public httpClient: HttpClient,
    public currency: CurrencyProvider,
    private api: ApiProvider
  ) {}

  public toEthAppBlock(block: ApiEthBlock): AppEthBlock {
    return {
      ...this.toAppBlock(block),
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      difficulty: block.difficulty,
      totalDifficulty: block.totalDifficulty
    };
  }

  public toUtxoCoinAppBlock(block: ApiUtxoCoinBlock): AppUtxoCoinBlock {
    const difficulty: number = 0x1d00ffff / block.bits;
    return {
      ...this.toAppBlock(block),
      merkleroot: block.merkleRoot,
      version: block.version,
      bits: block.bits.toString(16),
      difficulty
    };
  }

  public pktWorkForBits(bits: number): number {
    const compactToDbl = (c: number) => {
      if (c < 1) { return 0; }
      // Bitwise operations for decoding a compact integer
      // tslint:disable
      return (c & 0x007fffff) * Math.pow(256, (c >> 24) - 3);
      // tslint:enable
    };
    const TWO_TO_THE_256 = 1.157920892373162e+77;
    const workForTar = (target: number) => ( TWO_TO_THE_256 / (target + 1) );
    return workForTar(compactToDbl(bits));
  }

  public toPKTAppBlock(block: ApiUtxoCoinBlock): AppPktBlock {
    const aucb = this.toUtxoCoinAppBlock(block);
    const diff = this.pktWorkForBits(block.bits) / 4096;
    const out: AppPktBlock = {
      ...aucb,
      pkt: {
        totalWork: Math.floor(Math.pow(diff, 3)),
        annCount: -1,
        annWork: -1,
      }
    };
    out.difficulty = diff;
    return out;
  }

  public toAppBlock(block: ApiBlock): AppBlock {
    return {
      height: block.height,
      confirmations: block.confirmations,
      nonce: block.nonce,
      size: block.size,
      virtualSize: block.size,
      hash: block.hash,
      time: new Date(block.time).getTime() / 1000,
      tx: {
        length: block.transactionCount
      },
      txlength: block.transactionCount,
      previousblockhash: block.previousBlockHash,
      nextblockhash: block.nextBlockHash,
      poolInfo: {
        poolName: block.minedBy,
        url: ''
      },
      reward: block.reward
    };
  }

  public getCurrentHeight(
    chainNetwork: ChainNetwork
  ): Observable<ApiEthBlock & ApiUtxoCoinBlock> {
    const heightUrl = `${this.api.getUrl(chainNetwork)}/block/tip`;
    return this.httpClient.get<ApiEthBlock & ApiUtxoCoinBlock>(heightUrl);
  }

  public getBlocks(
    chainNetwork: ChainNetwork,
    numBlocks: number = 10
  ): Observable<ApiEthBlock[] & ApiUtxoCoinBlock[]> {
    const url = `${this.api.getUrl(chainNetwork)}/block?limit=${numBlocks}`;
    return this.httpClient.get<ApiEthBlock[] & ApiUtxoCoinBlock[]>(url);
  }

  public getCoinsForBlockHash(
    blockHash: string,
    chainNetwork: ChainNetwork,
    limit: number,
    page: number
  ): Observable<any> {
    const url = `${this.api.getUrl(
      chainNetwork
    )}/block/${blockHash}/coins/${limit}/${page}`;
    return this.httpClient.get(url);
  }

  /**
   * example: http://localhost:8100/api/BTC/regtest/block?since=582&limit=100&paging=height&direction=1
   */
  public pageBlocks(
    since: number,
    numBlocks: number = 10,
    chainNetwork: ChainNetwork
  ): Observable<ApiEthBlock[] & ApiUtxoCoinBlock[]> {
    const url = `${this.api.getUrl(
      chainNetwork
    )}/block?since=${since}&limit=${numBlocks}&paging=height&direction=-1`;
    return this.httpClient.get<ApiEthBlock[] & ApiUtxoCoinBlock[]>(url);
  }

  public getBlock(
    hash: string,
    chainNetwork: ChainNetwork
  ): Observable<ApiEthBlock & ApiUtxoCoinBlock> {
    const url = `${this.api.getUrl(chainNetwork)}/block/${hash}`;
    return this.httpClient.get<ApiEthBlock & ApiUtxoCoinBlock>(url);
  }
}
