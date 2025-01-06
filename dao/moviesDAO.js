let movies; //store reference to database

export default class MoviesDAO {
  
    //METHODS

  //called as soon as server starts, provides db reference to movies
  static async injectDB(conn) {
    //if reference already exists, return...
    if (movies) {
      return;
    }

    //...else connect to db name & collection
    try {
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
    } catch (e) {
      //if cannot get reference
      console.error(`unable to connect in MoviesDAO: ${e}`);
    }
  }

  static async getMovies({ //default filter object
    filters = null,
    page = 0,
    moviesPerPage = 20, //will only get 20 movies at once
  } = {}) {
    //construct query
    let query;
    if (filters) {
      if ("title" in filters) {
        query = { $text: { $search: filters["title"] } };
      } else if ("rated" in filters) {
        query = { rated: { $eq: filters["rated"] } };
      }
    }
    //find all movies that fit query and assign it to a cursor
    let cursor;
    try {
      cursor = await movies
        .find(query)
        .limit(moviesPerPage)
        .skip(moviesPerPage * page);

      const moviesList = await cursor.toArray();
      const totalNumMovies = await movies.countDocuments(query);
      return { moviesList, totalNumMovies };
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { moviesList: [], totalNumMovies: 0 };
    }
  }
}
