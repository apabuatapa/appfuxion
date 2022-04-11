import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import {bindActionCreators} from 'redux';
import * as pageActions from './redux/actions/place';
const API_KEY = 'AIzaSyA1MgLuZuyqR_OGY3ob3M52N46TDBRI_9k';
import ListItem from './components/ListItems';
import {connect} from 'react-redux';
import {addPlace} from './redux/actions/place';
const latitudeDelta = 0.025;
const longitudeDelta = 0.025;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitudeDelta,
        longitudeDelta,
        latitude: -6.2087634,
        longitude: 106.845599,
      },
      placeName: '',
      places: [],
      searchKeyword: '',
      searchResults: [],
      isShowingResults: false,
      setButton:false
    };
  }

  searchLocation = async text => {
    if (text == '') {
      this.setState({
        searchKeyword: '',
        isShowingResults: false,
      });
    } else {
      this.setState({searchKeyword: text});
      console.log(API_KEY);
      axios
        .request({
          method: 'post',
          url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${API_KEY}&input=${this.state.searchKeyword}`,
        })
        .then(response => {
          this.setState({
            searchResults: response.data.predictions,
            isShowingResults: true,
          });
        })
        .catch(e => {
          console.log(e.response);
        });
    }
  };

  placesOutput = () => {
    return (
      <FlatList
        style={styles.listContainer}
        data={this.props.places}
        keyExtractor={(item, index) => index.toString()}
        renderItem={info => <ListItem placeName={info.item.value} />}
      />
    );
  };
  onpressdata = item => {
  
    this.props.add(item.description);
    axios
    .request({
      method: 'post',
      url: `https://maps.googleapis.com/maps/api/place/details/json?placeid=${item.place_id}&key=${API_KEY}`,
    })
    .then(response => {
      this.setState({
        region: {
          latitudeDelta,
          longitudeDelta,
          latitude: response.data.result.geometry.location.lat,
          longitude: response.data.result.geometry.location.lng,
        },
      });
     
    })
   
    .catch(e => {
      console.log(e.response);
    });
    
    this.setState({
      isShowingResults: false,
    })
  };
  setHidden = ()=>{
    this.setState({
      setButton:this.state.setButton==false?true:false
    })

  }
  render() {
    return (
      <View style={styles.map}>
       {this.state.setButton==false ?<View style={styles.map}>
          <MapView style={styles.map} showsUserLocation={true} region={this.state.region} >
          <Marker coordinate={{ latitude: this.state.region.latitude, longitude: this.state.region.longitude }} />
          </MapView>
        </View>:null}
        <View style={styles.autocompleteContainer}>
          <TextInput
            placeholder="Search for an address"
            returnKeyType="search"
            style={styles.searchBox}
            placeholderTextColor="#000"
            onChangeText={text => this.searchLocation(text)}
            value={this.state.searchKeyword}
          />
          {this.state.isShowingResults && (
            <FlatList
              data={this.state.searchResults}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => this.onpressdata(item)}>
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index.toString()}
              style={styles.searchResultsContainer}
            />
          )}
          <TouchableOpacity
          onPress={()=>this.setHidden()}
            style={styles.buttoon}>
              <Text style={{alignSelf:'center'}}>{this.state.setButton==false?'List History':'close'}</Text>
            </TouchableOpacity>
        </View>
        {this.state.setButton==true?<View style = { styles.listContainer }>
        <Text style={{alignSelf:'center',fontWeight:'bold',fontSize:25}}>List Data</Text>
          { this.placesOutput() }
        </View>:null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  autocompleteContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  buttoon:{
    backgroundColor: 'white',
    width: 100,
    height: 45,
    justifyContent:'center',
    alignSelf: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  searchResultsContainer: {
    marginTop: 20,
    width: 250,
    height: 200,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 50,
  },
  map: {
    flex: 1,
  },
  dummmy: {
    width: 600,
    height: 200,
    backgroundColor: 'hotpink',
    marginTop: 20,
  },
  resultItem: {
    width: '100%',
    justifyContent: 'center',
    height: 40,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingLeft: 15,
  },
  searchBox: {
    marginTop: 20,
    width: 250,
    height: 50,
    fontSize: 18,
    borderRadius: 8,
    borderColor: '#aaa',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    paddingLeft: 15,
  },
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  placeInput: {
    width: '70%',
  },
  placeButton: {
    width: '30%',
  },
  listContainer: {
    marginTop: 100,
    backgroundColor: 'white',
    width: '100%',
    position: 'absolute',
  },
});
const mapStateToProps = state => {
  return {
    places: state.places.places,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: name => {
      dispatch(addPlace(name));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
