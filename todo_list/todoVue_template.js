// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.


import 'vue-loader/template-loader!pug-loader!vue-loader!source.vue?vue&type=template'

// <style scoped lang="scss">
import 'style-loader!css-loader!vue-loader/style-post-loader!sass-loader!vue-loader!source.vue?vue&type=style&index=1&scoped&lang=scss'


new Vue({
    el: '#app',
    render: h => h(App)
})



//      로컬 스토리지
var STORAGE_KEY = 'todos-vuejs-2.0'
var todoStorage = {
    fetch: function () {
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        todos.forEach(function (todo, index) {
            todo.id = index
        })
        todoStorage.uid = todos.length
        return todos
    },
    save: function (todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }
}


// visibility filters
var filters = {
    all: function (todos) {
        return todos
    },
    active: function (todos) {
        return todos.filter(function (todo) {
            return !todo.completed
        })
    },
    completed: function (todos) {
        return todos.filter(function (todo) {
            return todo.completed
        })
    }
}

// app Vue instance
var app = new Vue({
  // app initial state
    data: {
        todos: todoStorage.fetch(),
        newTodo: '',
        editedTodo: null,
        visibility: 'all'
    },

  // watch todos change for localStorage persistence
    watch: {
        todos: {
            handler: function (todos) {
                todoStorage.save(todos)
            },
            deep: true
        }
    },

  // computed properties
  // http://vuejs.org/guide/computed.html
    computed: {
        filteredTodos: function () {
            return filters[this.visibility](this.todos)
        },
        remaining: function() {
            return filters.active(this.todos).length
        },
        allDone: {
            get: function () {
                return this.remaining === 0
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value
                })
            }
        }
    },

    filters: {
        pluralize: function (n) {
            return n === 1 ? 'item' : 'items'
        }
    },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
    methods: {
        
//        추가
        addTodo: function () {
            var value = this.newTodo && this.newTodo.trim()
            if (!value) {
                return
            }
            this.todos.push({
                id: todoStorage.uid++,
                title: value,
                completed: false
            })
            this.newTodo = ''
        },

//        지우기
        removeTodo: function (todo) {
            this.todos.splice(this.todos.indexOf(todo), 1)
        },

//        수정 (더블클릭)
        editTodo: function (todo) {
            this.beforeEditCache = todo.title
            this.editedTodo = todo
        },

        doneEdit: function (todo) {
            if (!this.editedTodo) {
                return
            }
            this.editedTodo = null
            todo.title = todo.title.trim()
            if (!todo.title) {
                this.removeTodo(todo)
            }
        },

        cancelEdit: function (todo) {
            this.editedTodo = null
            todo.title = this.beforeEditCache
        },

        removeCompleted: function () {
            this.todos = filters.active(this.todos)
        }
    },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
    directives: {
        'todo-focus': function (el, binding) {
            if (binding.value) {
                el.focus()
            }
        }
    }
})


//      리스트 출력 부분
function onHashChange () {
    var visibility = window.location.hash.replace(/#\/?/, '');
    
    
    if (filters[visibility]) {
        app.visibility = visibility;
    } 
    else {
        window.location.hash = '';
        app.visibility = 'all';
    }
    
    
//    if (filters[visibility]) {
//        app.visibility = visibility
//    } else {
//        window.location.hash = ''
//        app.visibility = 'all'
//    }
    
}

window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.todoapp')