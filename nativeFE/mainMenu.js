import React, { useState, Component } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView, Alert, Platform } from 'react-native';
import Task from '../Components/Task';
import AsyncStorage from '@react-native-community/async-storage';
import keys from '../constants/Keys';
import Parse from "parse/react-native.js";

//Code from Back4App to connect with their database
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(keys.applicationId, keys.javascriptKey);
Parse.serverURL = keys.serverURL;

class App extends Component {
  //my own state
  constructor(props) {
    super(props);
    this.state = {
      task: "",
      taskItems: [],
      loading: false
    };
    //This line below is a must for setState
    this.onTaskInputChange = this.onTaskInputChange.bind(this);
  }

  //Load Database Function
  async componentDidMount() {
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('Task');
    try {
      let todos = await parseQuery.find();
      // Be aware that empty or invalid queries return as an empty array
      // Set results to state variable
      this.refreshListofTask();
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
    }
  };


  //Add Task Function
  async handleAddTask() {
    Keyboard.dismiss();
    if (this.state.task == null || this.state.task == "") {
      alert('No character detected' + "\n" + "Please Try Again");
      return;
    }
    var Task = Parse.Object.extend("Task");
    var currentTask = new Task();
    currentTask.set("description", this.state.task);
    try {
      await currentTask.save();
      this.setState({ loading: true });
      this.refreshListofTask();
    } catch (error) {
      alert('Failed to create new object, with error code: ' + error.message);
    }
    this.setState({ task: "" })
  }


  //Delete Task Function
  async completeTask(index) {
    if (this.state.loading == true) {
      return
    }
    else {
      const query = new Parse.Query("Task");
      query.equalTo("description", this.state.taskItems[index]); //Match with Description Name
      const object = await query.first(); //Delete First Match
      this.setState({ loading: true });
      try {
        await object.destroy();
        this.refreshListofTask();
      } catch (e) {
        alert(e)
      }
    }
  }

  async refreshListofTask() {
    const parseQuery = new Parse.Query('Task');
    try {
      let todos = await parseQuery.find();
      this.setState({ taskItems: [] });
      for (var i = 0; i < todos.length; i++) {
        var joined = this.state.taskItems.concat(todos[i].get('description'));
        this.setState({ taskItems: joined });
      }
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
    }
  }

  async onTaskInputChange(event) {
    this.setState({ task: event });
    this.refreshListofTask();
  }

  checkLoadingEvent() {
    if (!this.state.loading) {
      return (
        <TouchableOpacity onPress={() => this.handleAddTask()} >
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      )
    }
    else {
      setTimeout(() => { this.setState({ loading: false }) }, 2000)
      return (
        <View style={styles.addWrapper}>
          <ActivityIndicator size="small" color="#0000ff"/>
        </View>
      )
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {/*Title Page*/}
        <View style={styles.tasksWrapper}>
        <Text style={styles.sectionTitle}>Today's Task</Text>
        </View>
        <View style={styles.halfScreenforText}>
        <ScrollView style={styles.items}>

          {
            this.state.taskItems.map((item, index) => {
              return (

                <TouchableOpacity key={index} onPress={() => this.completeTask(index)}>
                  <Task text={item} />
                </TouchableOpacity>

              );
            })
          }
        </ScrollView>
        </View>
        <View style={styles.halfScreenforInput}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.writeTaskWrapper}
          >
            <TextInput style={styles.input} placeholder={"Write a task"} value={this.state.task} onChangeText={this.onTaskInputChange} />

            {this.checkLoadingEvent()}

          </KeyboardAvoidingView>
        </View>
      </View>

    );
  }
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  halfScreenforText: {
    marginTop:20,
    marginLeft: 50,
    marginRight:50,
    marginBottom:20,
    height: '65%',
    borderBottomColor: 'black',
    borderWidth: 1
  },
  halfScreenforInput: {
    height: '22%',
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  items: {
    marginTop: 30,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: 250,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  addText: {},
});
