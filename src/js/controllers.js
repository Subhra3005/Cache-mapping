app.controller('main', function($scope) {
    $scope.addresses = "";
    $scope.cache = new CacheSimulator(100);
    $scope.processAddress = function() {
      if( $scope.addresses.length && $scope.cache ) {
        var addresses = $scope.addresses.split(" ").map( function(ele){ return /w/g.test(ele)?parseInt(ele)+"w":parseInt(ele); } );
        addresses = _.reject( addresses, function(ele){ return isNaN(parseInt(ele))||ele===""||ele<0; } );
        if( addresses.length ) {
          $scope.cache.resolveRequest( addresses[0] );
          addresses.push( addresses.shift() );
        } 
        $scope.addresses = addresses.join(" ");
      }
  
    };
    $scope.cacheDescription = function( index ) {
      var cacheSimulator = $scope.cache,
          result = "";
  
      switch( cacheSimulator.cacheType() ) {
        case 0: result = cacheSimulator.setSize + "-Way Set Associative"; break;
        case 1: result = "Fully Associative"; break;
        case 2: result = "Direct Mapped"; break;
      }
  
      return result;
    };
  
    $scope.averageAccessTime = function() {
      var result = "0ns";
  
      if( $scope.cache ) {
        var avg = $scope.cache.averageAccessTime();
  
        if( !isNaN(avg) ) {
          result = avg.toFixed(2)+"ns";
        }
      }
  
      return result;
    };
    $scope.formattedHitRate = function() {
      var result = "0.00%",
          cacheSimulator = $scope.cache;
      if( cacheSimulator.requests != 0 ) {
        result = ((cacheSimulator.hits / cacheSimulator.requests)*100).toFixed(2)+"%";
      }
      return result;
    };
    $scope.renderBlockData = function( data ) {
      var result = "";
  
      if( data ) {
        if( data.length == 1 ) {
          result = data[0];
        } else {
          result = "[ ";
          for( var ele in data ) {
            if( ele == data.length-1 ) {
              result += data[ele]+" ]";
            } else {
              result += data[ele]+", ";
            }
          }
        }
      }
  
      return result;
    };
    $scope.clearCache = function() {
      $scope.cache.clear();
      var cacheSimulator = $scope.cache;
      $scope.cache = new CacheSimulator(cacheSimulator.external.mainMemoryAccessTime, cacheSimulator.external.cacheSize, cacheSimulator.external.blockSize, cacheSimulator.external.setSize, cacheSimulator.external.accessTime );
    };
  });
  