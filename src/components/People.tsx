import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import cn from 'classnames';

import { usePeopleDispatch, usePeopleState } from '../store/PeopleContext';

import { Person } from '../types';
import { getFilteredPeople } from '../services/getFilteredPeople';

export const People: React.FC = () => {
  const { people, filteredPeople } = usePeopleState();
  const dispatch = usePeopleDispatch();

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const params = React.useMemo(
    () => ({
      sex: searchParams.get('sex') || '',
      q: searchParams.get('q') || '',
      centuries: searchParams.getAll('centuries') || [],
      sort: (searchParams.get('sort') as keyof Person) || '',
      order: (searchParams.get('order') as 'desc') || '',
    }),
    [searchParams],
  );

  React.useEffect(() => {
    const result = getFilteredPeople(people, params);

    if (!result.length) {
      dispatch({
        type: 'SET_FILTERED_ERROR',
        payload: 'There are no people matching the current search criteria',
      });
    }

    dispatch({
      type: 'SET_FILTERED_PEOPLE',
      payload: result,
    });
  }, [params, dispatch, people]);

  const getSlugByName = (name: string) => {
    const human = people.find((person: Person) => person.name === name);

    return human?.slug || null;
  };

  const setNameColor = (sex: string) => {
    if (null) {
      return;
    }

    return cn({
      'has-text-danger': sex === 'f',
      'has-text-success': sex === 'm',
    });
  };

  return (
    <>
      {filteredPeople?.map((person: Person) => {
        const { name, sex, born, died, motherName, fatherName, slug } = person;

        const motherSlug = motherName ? getSlugByName(motherName) : null;

        const fatherSlug = fatherName ? getSlugByName(fatherName) : null;

        return (
          <tr
            key={Math.random()}
            data-cy="person"
            className={cn({
              'has-background-warning': slug === pathname.slice(8),
            })}
          >
            <td>
              <Link to={`/people/${slug}`} className={setNameColor(sex)}>
                {name}
              </Link>
            </td>

            <td>{sex}</td>

            <td>{born}</td>

            <td>{died}</td>

            <td>
              {motherSlug ? (
                <Link
                  to={`/people/${motherSlug}`}
                  className={setNameColor('f')}
                >
                  {motherName}
                </Link>
              ) : (
                <p>{motherName ? motherName : '-'}</p>
              )}
            </td>

            <td>
              {fatherSlug ? (
                <Link
                  to={`/people/${fatherSlug}`}
                  className={setNameColor('m')}
                >
                  {fatherName}
                </Link>
              ) : (
                <p>{fatherName ? fatherName : '-'}</p>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
};
