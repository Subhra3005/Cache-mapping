CacheSimulator = function( memoryAccessTime, cacheSize, blockSize, setSize, accessTime ) {

    this.mainMemoryAccessTime = memoryAccessTime;
    this.mainMemoryAccesses = 0;
    this.requests = 0;
    this.hits = 0;
    
    if( !this.validInput( [ cacheSize, blockSize, setSize ] ) ) {
      blockSize = 1;
      cacheSize = 4;
      setSize = 2;
    }
  
    if( !this.validInput( [ accessTime ] ) ) {
      accessTime = 10;
    }
    this.cacheSize = nearestPowerOfTwo( cacheSize );
    this.blockSize = nearestPowerOfTwo( blockSize );
    this.setSize = nearestPowerOfTwo( setSize );
    this.bitsForAddresses = 32;
    this.sets = []
  
    this.accessTime = accessTime;
    this.hits = 0;
    this.requests = 0;
  
    this.external = {
      mainMemoryAccessTime : this.mainMemoryAccessTime,
      blockSize : this.blockSize,
      cacheSize : this.cacheSize,
      setSize : this.setSize,
      accessTime : this.accessTime
    }
  
    if( this.setSize > this.cacheSize) {
      this.setSize = this.cacheSize;
    }
  
    for( var setIndex = 0; setIndex < (this.cacheSize/this.setSize); setIndex++ ) {
      var set = {
        index  : setIndex,
        lru    : 0, 
        blocks : [],
      }
  
      for( var block = 0; block < this.setSize; block++ ) {
        var data = [];
        for( var i = 0; i < this.blockSize; i++ ) {
          data.push("-");
        }
        set.blocks.push( {
          index : block,
          tag   : "",
          data  : data,
          lru   : this.setSize-(block+1),
          address : 0,
          valid : 0,
          dirty : 0
        });
      }
      this.sets.push( set );
    }
  
  }
  CacheSimulator.prototype.validInput = function( args ) {
    var result = true;
    for( var arg in args ) {
      arg = args[arg];
      if( typeof arg === "undefined" || parseInt(arg) === NaN ) {
        result = false;
        break;
      }
    }
    return result;
  }
  
  CacheSimulator.prototype.resolveRequest = function( address ) {
    var comps = this.getAddressComponents( parseInt( address ) ),
        hit = false,
        hitLru = 0;
        result = false;
    for( var block in this.sets[comps.set].blocks ) {
      block = this.sets[comps.set].blocks[block];
  
      // Hit!
      if( block.tag == comps.tag ) {
        hit = result = true;
        hitLru = block.lru;
  
        if( /w/g.test( address ) ) {
          block.dirty = 1;
        }
  
        break;
      }
    }
    if( !hit ) {
      var block = this.sets[comps.set].blocks[this.sets[comps.set].lru];
      // writing the data to the block
      block.dirty = 0;
      block.valid = 1;
      block.address = parseInt( address );
      block.tag = comps.tag;
      if( this.blockSize > 1 ) {
        result = this.fillBlock( block.data, comps );
      } else {
        block.data[comps.offset] = "*"+parseInt(address);
      }
    }
    var oldBlockLru = hit?hitLru:this.sets[comps.set].blocks[this.sets[comps.set].lru].lru;
  
    for( var blockIndex in this.sets[comps.set].blocks ) {
      var block = this.sets[comps.set].blocks[blockIndex];
  
      if( block.lru < oldBlockLru ) {
        block.lru++;
      } else if( block.lru == oldBlockLru ) {
        block.lru = 0;
      }
  
      if( block.lru == this.setSize-1) {
        this.sets[comps.set].lru = blockIndex;
      }
    }
    this.requests++;
    if( hit ) {
      this.hits++;
    } else {
      this.mainMemoryAccesses++;
    }
    return result;
  }
  CacheSimulator.prototype.fillBlock = function( dataArray, comps ) {
    var i = 0,
        entries = Math.pow( 2, comps.bitsForOffset ),
        higherOrderBits = comps.raw.substr( 0, this.bitsForAddresses-comps.bitsForOffset),
        ignore = false,
        result = false;
  
    // For each entry add the correct memory address to pull data from
    while( i < entries ) {
      var value = higherOrderBits + padLeft( decToBin( i ), comps.bitsForOffset );
      dataArray[i++] = "*"+parseInt( value, 2 );
    }
  
    return result;
  }
  
  // Returns type:
  // 0 : n-way set associative
  // 1 : Fully Associative
  // 2 : Direct Mapped
  CacheSimulator.prototype.cacheType = function() {
    var cacheSimulator = this,
        result = 0;
    if( cacheSimulator.cacheSize == 1 ) {
      result = 2;
    } else if( cacheSimulator.setSize == cacheSimulator.cacheSize ) {
      result = 1;
    } else if( cacheSimulator.setSize != 1 ) {
      result = 0;
    } else {
      result = 2;
    }
    return result;
  }
  CacheSimulator.prototype.getAddressComponents = function( address ) {
    var binAddress = padLeft(decToBin(address),this.bitsForAddresses),
        numberOfSets = this.cacheSize/this.setSize,
        bitsForSet = powOfTwo(numberOfSets),
        bitsForBlock = powOfTwo(this.blockSize),
        result = {
          tag : "",
          offset : 0,
          bitsForOffset : bitsForBlock,
          set : 0,
          bitsForSet : bitsForSet,
          raw : binAddress
        };
  
    if( this.blockSize > 1 ) {
      result.offset = parseInt( binAddress.substr( binAddress.length-bitsForBlock, bitsForBlock), 2 );
      binAddress = binAddress.substr(0, binAddress.length-bitsForBlock);
    }
  
    if( numberOfSets > 1 ) {
      result.set = parseInt( binAddress.substr( binAddress.length-bitsForSet, bitsForSet), 2 );
      binAddress = binAddress.substr(0, binAddress.length-bitsForSet );
    }
    result.tag = binAddress;
    return result;
  }
  
  CacheSimulator.prototype.clear = function() {
    this.mainMemoryAccesses = 0;
    this.requests = 0;
    this.hits = 0;
    this.mainMemoryAccessTime = this.external.mainMemoryAccessTime;
  }
  
  CacheSimulator.prototype.averageAccessTime = function() {
    var time = 0;
    time += this.mainMemoryAccesses*this.mainMemoryAccessTime;
    time += this.requests * this.accessTime;
    return time/this.requests;
  }
  
  
  