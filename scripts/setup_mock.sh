git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git hapi-fhir-jpaserver
cd hapi-fhir-jpaserver
#checkout specific commit to stabilize pipeline
git checkout 4471b32b7beaa8cfa10eec34a9b440dff1b85577
sed -i -e 's/config.addAllowedHeader("Origin");/config.addAllowedHeader("Origin");config.addAllowedHeader("cache-control");config.addAllowedHeader("Prefer");config.addAllowedHeader("If-Match");/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/"PATCH")/"PATCH", "HEAD")/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/\/fhir\//\/fhir\/R4\//g' src/main/webapp/WEB-INF/web.xml
sed -i -e 's/server_address=http:\/\/localhost:8080\/hapi-fhir-jpaserver\/fhir\//server_address=http:\/\/localhost:8080\/fhir\/R4\//g' src/main/resources/hapi.properties
sed -i -e 's/<contextPath>\/hapi-fhir-jpaserver<\/contextPath>/<contextPath>\/<\/contextPath>/g' pom.xml
mvn clean install -DskipTests
docker build -t hapi-fhir-jpaserver .
docker run -p 8080:8080 -d hapi-fhir-jpaserver
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8080)" != "200" ]]; do sleep 1; done'
cd ..
rm -rf hapi-fhir-jpaserver
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/StructureDefinition.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/CodeSystem.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/ValueSet.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/Encounter.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/Patient.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/Practitioner.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/PractitionerRole.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/Organization.json --header "Content-Type: application/json"
# update a specific patient to test versioning
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/update-patient.json --header "Content-Type: application/json"
