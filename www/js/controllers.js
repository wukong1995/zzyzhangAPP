angular.module('starter.controllers', [])
  .controller('SigninCtrl', ['$scope', '$location', '$timeout', '$ionicLoading', 'PopupSer', 'LoginSer',
    function($scope, $location, $timeout, $ionicLoading, PopupSer, LoginSer) {
      if (localStorage.getItem('userid')) {
        $location.path('/app/first');
      }

      $scope.user = {
        name: localStorage.getItem('username') || '',
        password: localStorage.getItem('password') || ''
      }

      $scope.doLogin = function() {
        $ionicLoading.show({
          template: '正在登录'
        });
        LoginSer.signin($scope.user).then(function(res) {
          $ionicLoading.hide();
          if (res.success == 0) {
            $ionicLoading.hide();
            PopupSer.show(res.message);
          } else {
            localStorage.setItem('userid', res.user._id);
            localStorage.setItem('username', $scope.user.name);
            localStorage.setItem('password', $scope.user.password);
            $location.path('/app/first');
          }
        }, function(err) {
          $ionicLoading.hide();
          PopupSer.alertErr(err);
        });
      };
    }
  ])
  .controller('SignupCtrl', ['$scope', '$location', '$timeout', '$ionicLoading', 'PopupSer', 'LoginSer',
    function($scope, $location, $timeout, $ionicLoading, PopupSer, LoginSer) {

      $scope.doSignup = function() {

        if ($scope.user.password != $scope.user.confirpwd) {
          PopupSer.show('两次输入密码不一致');
          return;
        }

        $ionicLoading.show({
          template: '正在注册'
        });
        LoginSer.signup($scope.user).then(function(res) {
          $ionicLoading.hide();
          if (res.success == 0) {
            $ionicLoading.hide();
            PopupSer.show(res.message);
          } else {
            PopupSer.show(res.message);
            $location.path('/signin');
          }
        }, function(err) {
          $ionicLoading.hide();
          PopupSer.alertErr(err);
        });
      };
    }
  ])
  .controller('ForgetpwdCtrl', ['$scope', '$location', '$timeout', '$ionicLoading', 'PopupSer', 'LoginSer',
    function($scope, $location, $timeout, $ionicLoading, PopupSer, LoginSer) {
      $scope.doForgetpwd = function() {

        $ionicLoading.show({
          template: '正在重置'
        });
        LoginSer.forgetpwd($scope.user).then(function(res) {
          $ionicLoading.hide();
          if (res.success == 0) {
            PopupSer.show(res.message);
          } else {
            PopupSer.alert('密码已重置为123456，请及时修改密码!');
            $location.path('/signin');
          }
        }, function(err) {
          $ionicLoading.hide();
          PopupSer.alertErr(err);
        });
      };
    }
  ])
  .controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', function($scope, $ionicModal, $timeout) {
    //
  }])
  .controller('PayCtrl', ['$scope', '$ionicLoading', '$location', 'Const', 'PopupSer', 'CommonSer',
    function($scope, $ionicLoading, $location, Const, PopupSer, CommonSer) {
      // 初始化参数
      var self = this;
      self.reset = function() {
        self.page = 0;
        self.limit = 15;
        $scope.keyword = '';
        $scope.items = [];
        $scope.moredata = false;
      }

      $scope.loadData = function() {
        CommonSer.getList(Const.payment, $scope.keyword, self.page, self.limit)
          .then(function(res) {
            $scope.page = res.page;
            $scope.items.push.apply($scope.items, res.data);
            if ($scope.page * self.limit > res.totalCount) {
              $scope.moredata = false;
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
      };

      self.reset();
      $scope.loadData();

      $scope.doRefresh = function() {
        self.reset();
        $scope.loadData();
        $scope.$broadcast('scroll.refreshComplete');
      }

      $scope.search = function(keyword) {
        $scope.keyword = keyword;
        $scope.loadData();
      }

      $scope.onItemDelete = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认删除这条记录？');

        confirmPopup.then(function(res) {
          if (res) {
            CommonSer.delItem(Const.payment, item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('删除成功');
                } else {
                  PopupSer.alert('删除出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };
    }
  ])
  .controller('PayDetailCtrl', ['$scope', '$stateParams', 'Const', 'CommonSer', 'PopupSer',
    function($scope, $stateParams, Const, CommonSer, PopupSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.payment, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.payment = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });
    }
  ])
  .controller('PayAddCtrl', ['$scope', '$ionicLoading', '$ionicTabsDelegate', '$location', 'PaySer', 'PopupSer',
    function($scope, $ionicLoading, $ionicTabsDelegate, $location, PaySer, PopupSer) {
      $scope.payment = {
        type: 0,
        product_type: '工资'
      };
      $scope.payment1 = {
        type: 1,
        product_type: '饮食'
      };
      $scope.doSubmit = function() {

        if ($ionicTabsDelegate.selectedIndex() == 0) {
          PaySer.save($scope.payment).then(function(res) {
            if (res.success == 0) {
              PopupSer.show(res.message);
            } else {
              PopupSer.show('增加成功');
              $location.path('/app/pay/detail/' + res.id);
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
        } else {
          PaySer.save($scope.payment1).then(function(res) {
            if (res.success == 0) {
              PopupSer.show(res.message);
            } else {
              PopupSer.show('增加成功');
              $location.path('/app/pay/detail/' + res.id);
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
        }

      };
    }
  ])
  .controller('ShareCtrl', ['$scope', '$ionicLoading', '$location', 'Const', 'PopupSer', 'CommonSer',
    function($scope, $ionicLoading, $location, Const, PopupSer, CommonSer) {
      // 初始化参数
      var self = this;
      self.reset = function() {
        self.page = 0;
        self.limit = 15;
        $scope.keyword = '';
        $scope.items = [];
        $scope.moredata = false;
      }

      $scope.loadData = function() {
        CommonSer.getList(Const.share, $scope.keyword, self.page, self.limit)
          .then(function(res) {
            $scope.page = res.page;
            $scope.items.push.apply($scope.items, res.data);
            if ($scope.page * self.limit > res.totalCount) {
              $scope.moredata = false;
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
      };

      self.reset();
      $scope.loadData();

      $scope.doRefresh = function() {
        self.reset();
        $scope.loadData();
        $scope.$broadcast('scroll.refreshComplete');
      }

      $scope.search = function(keyword) {
        $scope.keyword = keyword;
        $scope.loadData();
      }

      $scope.onItemDelete = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认删除这条记录？');

        confirmPopup.then(function(res) {
          if (res) {
            CommonSer.delItem(Const.share, item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('删除成功');
                } else {
                  PopupSer.alert('删除出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };
    }
  ])
  .controller('ShareDetailCtrl', ['$scope', '$stateParams', 'Const', 'CommonSer', 'PopupSer',
    function($scope, $stateParams, Const, CommonSer, PopupSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.share, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.share = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });
    }
  ])
  .controller('ShareAddCtrl', ['$scope', '$stateParams', '$timeout', '$location', function($scope, $stateParams, $timeout, $location) {
    $scope.title = '收支增加';
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      $timeout(function() {
        $location.path('/app/pay/detail/0');
      }, 1000);
    };
  }])
  .controller('BorrowCtrl', ['$scope', '$ionicLoading', '$location', 'Const', 'PopupSer', 'CommonSer',
    function($scope, $ionicLoading, $location, Const, PopupSer, CommonSer) {
      // 初始化参数
      var self = this;
      self.reset = function() {
        self.page = 0;
        self.limit = 15;
        $scope.keyword = '';
        $scope.items = [];
        $scope.moredata = false;
      }

      $scope.loadData = function() {
        CommonSer.getList(Const.borrow, $scope.keyword, self.page, self.limit)
          .then(function(res) {
            $scope.page = res.page;
            $scope.items.push.apply($scope.items, res.data);
            if ($scope.page * self.limit > res.totalCount) {
              $scope.moredata = false;
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
      };

      self.reset();
      $scope.loadData();

      $scope.doRefresh = function() {
        self.reset();
        $scope.loadData();
        $scope.$broadcast('scroll.refreshComplete');
      }

      $scope.search = function(keyword) {
        $scope.keyword = keyword;
        $scope.loadData();
      }

      $scope.onItemDelete = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认删除这条记录？');

        confirmPopup.then(function(res) {
          if (res) {
            CommonSer.delItem(Const.borrow, item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('删除成功');
                } else {
                  PopupSer.alert('删除出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };
    }
  ])
  .controller('BorrowDetailCtrl', ['$scope', '$stateParams', 'Const', 'CommonSer', 'PopupSer',
    function($scope, $stateParams, Const, CommonSer, PopupSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.borrow, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.borrow = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });
    }
  ])
  .controller('BorrowAddCtrl', ['$scope', '$stateParams', '$timeout', '$location', function($scope, $stateParams, $timeout, $location) {
    $scope.title = '收支增加';
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      $timeout(function() {
        $location.path('/app/pay/detail/0');
      }, 1000);
    };
  }])
  .controller('BondCtrl', ['$scope', '$ionicLoading', '$location', 'Const', 'PopupSer', 'CommonSer',
    function($scope, $ionicLoading, $location, Const, PopupSer, CommonSer) {
      // 初始化参数
      var self = this;
      self.reset = function() {
        self.page = 0;
        self.limit = 15;
        $scope.keyword = '';
        $scope.items = [];
        $scope.moredata = false;
      }

      $scope.loadData = function() {
        CommonSer.getList(Const.bond, $scope.keyword, self.page, self.limit)
          .then(function(res) {
            $scope.page = res.page;
            $scope.items.push.apply($scope.items, res.data);
            if ($scope.page * self.limit > res.totalCount) {
              $scope.moredata = false;
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
      };

      self.reset();
      $scope.loadData();

      $scope.doRefresh = function() {
        self.reset();
        $scope.loadData();
        $scope.$broadcast('scroll.refreshComplete');
      }

      $scope.search = function(keyword) {
        $scope.keyword = keyword;
        $scope.loadData();
      }

      $scope.onItemDelete = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认删除这条记录？');

        confirmPopup.then(function(res) {
          if (res) {
            CommonSer.delItem(Const.bond, item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('删除成功');
                } else {
                  PopupSer.alert('删除出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };
    }
  ])
  .controller('BondDetailCtrl', ['$scope', '$stateParams', 'Const', 'CommonSer', 'PopupSer',
    function($scope, $stateParams, Const, CommonSer, PopupSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.bond, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.bond = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });
    }
  ])
  .controller('BondAddCtrl', ['$scope', '$stateParams', '$timeout', '$location', function($scope, $stateParams, $timeout, $location) {
    $scope.title = '收支增加';
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      $timeout(function() {
        $location.path('/app/pay/detail/0');
      }, 1000);
    };
  }])
  .controller('AssetsCtrl', ['$scope', '$ionicLoading', '$location', 'Const', 'PopupSer', 'CommonSer',
    function($scope, $ionicLoading, $location, Const, PopupSer, CommonSer) {
      // 初始化参数
      var self = this;
      self.reset = function() {
        self.page = 0;
        self.limit = 15;
        $scope.keyword = '';
        $scope.items = [];
        $scope.moredata = false;
      }

      $scope.loadData = function() {
        CommonSer.getList(Const.assets, $scope.keyword, self.page, self.limit)
          .then(function(res) {
            $scope.page = res.page;
            $scope.items.push.apply($scope.items, res.data);
            if ($scope.page * self.limit > res.totalCount) {
              $scope.moredata = false;
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
      };

      self.reset();
      $scope.loadData();

      $scope.doRefresh = function() {
        self.reset();
        $scope.loadData();
        $scope.$broadcast('scroll.refreshComplete');
      }

      $scope.search = function(keyword) {
        $scope.keyword = keyword;
        $scope.loadData();
      }

      $scope.edit = function(id) {
        $location.path('/app/assets/edit/' + id);
      }

      $scope.onItemDelete = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认删除这条记录？');

        confirmPopup.then(function(res) {
          if (res) {
            CommonSer.delItem(Const.assets, item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('删除成功');
                } else {
                  PopupSer.alert('删除出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };
    }
  ])
  .controller('AssetsDetailCtrl', ['$scope', '$stateParams', 'Const', 'CommonSer', 'PopupSer',
    function($scope, $stateParams, Const, CommonSer, PopupSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.assets, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.assets = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });
    }
  ])
  .controller('AssetsAddCtrl', ['$scope', '$location', 'PopupSer', 'AssetsSer',
    function($scope, $location, PopupSer, AssetsSer) {
      $scope.assets = {
        type: "流动资产"
      };

      $scope.doSubmit = function() {
        AssetsSer.save($scope.assets).then(function(res) {
          if (res.success == 0) {
            PopupSer.show(res.message);
          } else {
            PopupSer.show('增加成功');
            $location.path('/app/assets/detail/' + res.id);
          }
        }, function(err) {
          PopupSer.alertErr(err);
        });
      };
    }
  ])
  .controller('AssetsEditCtrl', ['$scope', '$location', '$stateParams', 'PopupSer', 'Const', 'CommonSer', 'AssetsSer',
    function($scope, $location, $stateParams, PopupSer, Const, CommonSer, AssetsSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.assets, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.assets = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });

      $scope.doSubmit = function() {
        AssetsSer.save($scope.assets).then(function(res) {
          if (res.success == 0) {
            PopupSer.show(res.message);
          } else {
            PopupSer.show('修改成功');
            $location.path('/app/assets/detail/' + res.id);
          }
        }, function(err) {
          PopupSer.alertErr(err);
        });
      };
    }
  ])
  .controller('WishCtrl', ['$scope', '$ionicLoading', '$location', 'Const', 'PopupSer', 'CommonSer', 'WishSer',
    function($scope, $ionicLoading, $location, Const, PopupSer, CommonSer, WishSer) {
      // 初始化参数
      var self = this;

      self.reset = function() {
        self.page = 0;
        self.limit = 15;
        $scope.keyword = '';
        $scope.items = [];
        $scope.moredata = false;
      }

      $scope.loadData = function() {
        CommonSer.getList(Const.wish, $scope.keyword, self.page, self.limit)
          .then(function(res) {
            $scope.page = res.page;
            $scope.items.push.apply($scope.items, res.data);
            if ($scope.page * self.limit > res.totalCount) {
              $scope.moredata = false;
            }
          }, function(err) {
            PopupSer.alertErr(err);
          });
      };

      self.reset();
      $scope.loadData();

      $scope.doRefresh = function() {
        self.reset();
        $scope.loadData();
        $scope.$broadcast('scroll.refreshComplete');
      }

      $scope.search = function(keyword) {
        $scope.keyword = keyword;
        $scope.loadData();
      }

      $scope.onItemDelete = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认删除这条记录？');

        confirmPopup.then(function(res) {
          if (res) {
            CommonSer.delItem(Const.wish, item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('删除成功');
                } else {
                  PopupSer.alert('删除出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };

      $scope.buy = function(item) {
        // 一个确认对话框
        var confirmPopup = PopupSer.confirm('确认已经实现？');

        confirmPopup.then(function(res) {
          if (res) {
            WishSer.buy(item._id)
              .then(function(data) {
                if (data.success === 1) {
                  $scope.items.splice($scope.items.indexOf(item), 1);
                  PopupSer.alert('操作成功');
                } else {
                  PopupSer.alert('操作出错，请重试！');
                }
              }, function(err) {
                PopupSer.alertErr(err);
              });
          }
        });
      };
    }
  ])
  .controller('WishDetailCtrl', ['$scope', '$stateParams', 'Const', 'CommonSer', 'PopupSer',
    function($scope, $stateParams, Const, CommonSer, PopupSer) {
      $scope.id = $stateParams.id;

      CommonSer.detail(Const.wish, $scope.id)
        .then(function(res) {
          if (res.success == 1) {
            $scope.wish = res.data;
          } else {
            PopupSer.alert('后台查询错误');
          }

        }, function(err) {
          PopupSer.alertErr(err);
        });
    }
  ])
  .controller('WishAddCtrl', ['$scope', '$stateParams', '$timeout', '$location', function($scope, $stateParams, $timeout, $location) {
    $scope.title = '收支增加';
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      $timeout(function() {
        $location.path('/app/pay/detail/0');
      }, 1000);
    };
  }])
  .controller('WishEditCtrl', ['$scope', '$stateParams', 'WishSer', function($scope, $stateParams, WishSer) {
    $scope.id = $stateParams.id;

    shareSer.detail($scope.id).then(function(data) {
      $scope.sharement = data.sharement;

    }, function(err) {
      $ionicPopup.alert({
        title: '请求错误',
        template: err,
        okText: '确认'
      });
    });
  }])
  .controller('UserCtrl', ['$scope', '$location', 'PopupSer', function($scope, $location, PopupSer) {

    $scope.show = function(item) {
      var confirmPopup = PopupSer.confirm('确定注销账户？');

      confirmPopup.then(function(res) {
        if (res) {
          localStorage.removeItem('userid');
          $location.path('/');
        }
      });
    };
  }])
  .controller('UserDetailCtrl', ['$scope', '$ionicLoading', '$ionicPopup', 'UserSer',
    function($scope, $ionicLoading, $ionicPopup, UserSer) {
      $ionicLoading.show({
        template: '正在获得数据'
      });

      UserSer.detail().then(function(res) {
        $ionicLoading.hide();
        if (res.success == 0) {
          PopupSer.show(res.message);
        } else {
          $scope.user = res.user;
        }
      }, function(err) {
        PopupSer.alertErr(err);
      });
    }
  ])
  .controller('UserChangeCtrl', ['$scope', '$location', '$ionicLoading', 'ionicDatePicker', 'UserSer', 'PopupSer',
    function($scope, $location, $ionicLoading, ionicDatePicker, UserSer, PopupSer) {
      $ionicLoading.show({
        template: '正在获得数据'
      });

      UserSer.detail().then(function(res) {
        $ionicLoading.hide();
        if (res.success == 0) {
          PopupSer.show(res.message);
        } else {
          $scope.user = res.user;
        }
      }, function(err) {
        PopupSer.alertErr(err);
      });

      $scope.chooseBirth = function() {
        var ipObj1 = {
          callback: function(val) {
            $scope.user.birth = new Date(val);
          },
          inputDate: new Date($scope.user.birth)
        };
        ionicDatePicker.openDatePicker(ipObj1);
      };

      $scope.doChange = function() {

        $ionicLoading.show({
          template: '正在修改'
        });
        UserSer.changepro($scope.user).then(function(res) {
          $ionicLoading.hide();

          if (res.success == 0) {
            $ionicLoading.hide();
            PopupSer.show(res.msg);
          } else {
            PopupSer.show(res.msg);
            $location.path('/app/user/detail');
          }
        }, function(err) {
          $ionicLoading.hide();
          PopupSer.alertErr(err);
        });
      };

    }
  ])
  .controller('UserChangepwdCtrl', ['$scope', '$ionicLoading', '$location', 'UserSer', 'PopupSer',
    function($scope, $ionicLoading, $location, UserSer, PopupSer) {

      $scope.doChange = function() {

        if ($scope.user.newpwd != $scope.user.confirpwd) {
          PopupSer.show('两次输入密码不一致');
          return;
        }
        $ionicLoading.show({
          template: '正在修改'
        });
        UserSer.changepwd($scope.user).then(function(res) {
          $ionicLoading.hide();
          if (res.success == 0) {
            $ionicLoading.hide();
            PopupSer.show(res.message);
          } else {
            PopupSer.show(res.message);
            localStorage.removeItem('userid');
            $location.path('/signin');
          }
        }, function(err) {
          $ionicLoading.hide();
          PopupSer.alertErr(err);
        });
      };
    }
  ]);