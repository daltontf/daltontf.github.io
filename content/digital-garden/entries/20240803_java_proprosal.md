+++
title = "Proposed Java Syntax for Extension Methods and Type Safety"

[taxonomies]
tags=["Software Development"]
start-date=["2024-08-03"]
last-update-date=["2024-08-03"]

+++

### The Initial Idea

While working on a recent Java project where we had the concept of a `String id` and a `String token` for accessing persisted data indexed by that id and while requiring the caller provide a match for the token. 

Both fields being `String` made me wish the type system could help me not get the two crossed as method parameters. I thought about Rust's "new type" that provide a form of that type safety at zero cost at runtime. (https://doc.rust-lang.org/rust-by-example/generics/new_types.html):

    struct Years(i64);

    struct Days(i64);

    impl Years {
	    pub fn to_days(&self) -> Days {
    	    Days(self.0 * 365)
	    }
    }

    impl Days {
	    /// truncates partial years
	    pub fn to_years(&self) -> Years {
    	    Years(self.0 / 365)
    	}
    }

    fn is_adult(age: &Years) -> bool {
	    age.0 >= 18
    }

    fn main() {
	    let age = Years(25);
	    let age_days = age.to_days();
	    println!("Is an adult? {}", is_adult(&age));
	    println!("Is an adult? {}", is_adult(&age_days.to_years()));
	    // println!("Is an adult? {}", is_adult(&age_days));
    }

Though is "zero cost" at runtime, however there is some syntactic overhead to reference contained value of the `struct` as a single element tuple.

---

##### Something Like This, But Java

The idea that popped in my head for the type safety also provides a way of supporting extension methods to existing class without inheritance. 

The addition of default methods to Java interfaces is basis of implementing this concept. However, three other things would need to be added. 

1. A way to restrict the type that can implement an interface. Kind of like Scala can with Traits:

        trait MyTrait {
            this: RestrictedToType => ...

1. Force the interface to only have default methods. This is for existing classes as a way to extend them.

1. Have the compiler treat an object with the interface type as an instance of that type OR the "restricted to" type.

The idea circulating in my head would look involve a new keyword. Let's just call it `extension`. It will be a lot like an `interface` but will support a parameter indicating the implementing type:

    extension Years(Long) {
        public Days toDays() { 
            return this * 365 // what about leap years? ;)
        }
    }

    extension Days(Long) {
        /// truncates partial years
	    public Years toYears() { 
		    return this / 365;
        }
    }

The `(Long)` parameters indicate the type implementing classes are restricted to. It could be `(Long this)` to be more explicit.

The `toYears()` method will be compile a method, `static Days.toYears(Long)`. The rest of the Rust code above in Java would look like:

    boolean isAdult(Years age) {
        return age > 18L;	
    }

    void main() {
        Years age = 25L; 
        Days ageDays = age.toDays();
	    System.out.printf("Is an adult? %d", isAdult(age));
	    System.out.printf("Is an adult? %d", isAdult(ageDays.toYears()));
	    // System.out.printf("Is an adult? %d", isAdult(ageDays)); 
    }


The `Years age = 25L;` line indicates that age is a long that “implements” Years with toDays being a default method. 

The commented out line would fail at compile time since the method requires a Year implementation.

### 'Noodling' through other implications of this

##### Passing to Methods

Passing passing a `long` to `isAdult(Years age)` should require a cast to `Years`:

    boolean x = isAdult((Years) 20L);

If the class above also had method:

    boolean isAdult(Days age) {
        return age.toYears() > 18L;	
    }    

And this method below (even if this is what this enhancement is trying to help with):

    boolean isAdult(long age) {
        // code that makes assumptions about what 'age' represents...	
    }

The three `isAdult` methods should be able co-exist since the methods take three different types `long`, `Years` and `Days`.

---

If there is a method:

    public longMethod(long age) { … }

Both `Years` and `Days` can be passed in. Inside the method the extension functionality is lost. They are just `long`.

    stringMethod(age); 
    stringMethod(ageDays);

Both of these method calls are valid.

---

##### Calling Methods on the Underlying Type

Suppose there is a `Token` extension for a `String` for compile type type safety:

    extension Token(String) { ... }

The compiler should take into account that method on an extension is being invoked and secondarily look for the method on the underlying type

    Token token = "foobar";
    String upShiftedString = token.toUpperCase();
    Token upShiftedToken = token.toUpperCase();

##### Overriding Methods of the Underlying Type



Both `toUpperCase` invocations are valid and invoke at runtime of the `String.toUpperCase` method.

---

##### Supporting Multiple 'Extensions'

For a first implementation only multiple extensions would require inheritance: 

    extension Foo(String) {
        …
    }

    extension FooBar(String) extends Foo{ 
        …
    }

    FooBar fooBar = “foobar”;

---
##### Extensions can implement interfaces

    interface TestForAdulthood {
	    boolean isAdult();
    }

    extension Year(Long) implements TestForAdulthood {
        @Override
        boolean isAdult() {
	        return this / 18;
        }    
    }

    extension Days(Long) implements TestForAdulthood { 
        @Override
        boolean isAdult() {
	        return this.toYears().isAdult();
        }
    }

At runtime, extensions are just interfaces with nothing but default methods. Which brings up the subject of reflection. 

Should the "restricted to" type of the interface be like a generic type and not be available for introspection? For a proof a concept, reflection is not a necessity. 
